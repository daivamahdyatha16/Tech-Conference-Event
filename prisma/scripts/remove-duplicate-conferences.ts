/**
 * One-time cleanup script for conferences duplicated by running `prisma db seed`
 * more than once (the Conference model has no unique constraint on `title`,
 * so `skipDuplicates` in the seed never caught this — and since ticket types
 * are seeded per-conference too, every duplicate conference ends up with its
 * own duplicate ticket types as well).
 *
 * For every group of conferences sharing the exact same title:
 *   - the row with the smallest id is kept
 *   - every other row in the group is a candidate for deletion
 *
 * A duplicate is only ever deleted if ALL of the following hold:
 *   - it has zero reviews
 *   - it has zero promotions
 *   - it has zero transactions directly on the conference
 *   - every one of its ticket types has zero transactions
 *
 * By default, a duplicate that still has ticket types is SKIPPED and
 * reported (conservative mode) — deleting the conference is impossible
 * anyway while its ticket types exist, because every relevant foreign key
 * in the schema is `ON DELETE RESTRICT`.
 *
 * Pass --cascade-empty-ticket-types to also remove ticket types that have
 * zero transactions, so their (equally duplicated, equally empty) parent
 * conference can be removed too. Ticket types that have ANY transaction are
 * never touched, and a conference with any review/promotion/transaction of
 * its own is never touched, with or without this flag.
 *
 * Even if this script's own bookkeeping were ever wrong, Postgres itself
 * would reject a delete that still has dependents (RESTRICT) — this does
 * not rely solely on the counts computed here.
 *
 * Usage:
 *   npx tsx prisma/scripts/remove-duplicate-conferences.ts
 *   npx tsx prisma/scripts/remove-duplicate-conferences.ts --dry-run
 *   npx tsx prisma/scripts/remove-duplicate-conferences.ts --cascade-empty-ticket-types
 *   npx tsx prisma/scripts/remove-duplicate-conferences.ts --dry-run --cascade-empty-ticket-types
 */

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const isDryRun = process.argv.includes("--dry-run");
const cascadeEmptyTicketTypes = process.argv.includes(
  "--cascade-empty-ticket-types"
);

async function main() {
  console.log(
    `${isDryRun ? "🔍 Dry run — no data will be deleted." : "🧹 Removing duplicate conferences..."}` +
      `${cascadeEmptyTicketTypes ? " (cascading into empty ticket types)" : ""}\n`
  );

  const allConferences = await prisma.conference.findMany({
    select: { id: true, title: true },
    orderBy: { id: "asc" },
  });

  const groupsByTitle = new Map<string, number[]>();
  for (const conference of allConferences) {
    const ids = groupsByTitle.get(conference.title) ?? [];
    ids.push(conference.id);
    groupsByTitle.set(conference.title, ids);
  }

  const duplicateGroups = [...groupsByTitle.entries()].filter(
    ([, ids]) => ids.length > 1
  );

  if (duplicateGroups.length === 0) {
    console.log("No duplicate conference titles found. Nothing to do.");
    return;
  }

  console.log(`Found ${duplicateGroups.length} title(s) with duplicates.\n`);

  let deletedCount = 0;
  let skippedCount = 0;

  for (const [title, ids] of duplicateGroups) {
    const [keepId, ...duplicateIds] = ids;

    console.log(`Title: "${title}"`);
    console.log(`  Keeping id=${keepId} (smallest id)`);

    for (const duplicateId of duplicateIds) {
      const [reviewCount, promotionCount, transactionCount, ticketTypes] =
        await Promise.all([
          prisma.review.count({ where: { conferenceId: duplicateId } }),
          prisma.promotion.count({ where: { conferenceId: duplicateId } }),
          prisma.transaction.count({ where: { conferenceId: duplicateId } }),
          prisma.ticketType.findMany({
            where: { conferenceId: duplicateId },
            select: {
              id: true,
              _count: { select: { transactions: true } },
            },
          }),
        ]);

      const ticketTypesWithTransactions = ticketTypes.filter(
        (t) => t._count.transactions > 0
      );
      const emptyTicketTypeIds = ticketTypes
        .filter((t) => t._count.transactions === 0)
        .map((t) => t.id);

      const hasBlockingData =
        reviewCount > 0 ||
        promotionCount > 0 ||
        transactionCount > 0 ||
        ticketTypesWithTransactions.length > 0;

      if (hasBlockingData) {
        console.warn(
          `  ⚠ SKIPPED id=${duplicateId} — has related data ` +
            `(reviews=${reviewCount}, promotions=${promotionCount}, ` +
            `transactions=${transactionCount}, ` +
            `ticketTypesWithTransactions=${ticketTypesWithTransactions.length}). ` +
            `Review manually before deleting.`
        );
        skippedCount++;
        continue;
      }

      if (emptyTicketTypeIds.length > 0 && !cascadeEmptyTicketTypes) {
        console.warn(
          `  ⚠ SKIPPED id=${duplicateId} — has ${emptyTicketTypeIds.length} ` +
            `ticket type(s) with no transactions. Re-run with ` +
            `--cascade-empty-ticket-types to remove those too, or delete manually.`
        );
        skippedCount++;
        continue;
      }

      if (isDryRun) {
        if (emptyTicketTypeIds.length > 0) {
          console.log(
            `  [dry-run] Would delete ${emptyTicketTypeIds.length} empty ticket type(s), then id=${duplicateId}.`
          );
        } else {
          console.log(`  [dry-run] Would delete id=${duplicateId} (no related data).`);
        }
        deletedCount++;
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          if (emptyTicketTypeIds.length > 0) {
            await tx.ticketType.deleteMany({
              where: { id: { in: emptyTicketTypeIds } },
            });
          }
          await tx.conference.delete({ where: { id: duplicateId } });
        });
        console.log(`  ✓ Deleted id=${duplicateId}.`);
        deletedCount++;
      } catch (error) {
       
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2003"
        ) {
          console.warn(
            `  ⚠ SKIPPED id=${duplicateId} — database rejected the delete ` +
              `(a related row appeared after the check above). Review manually.`
          );
          skippedCount++;
        } else {
          throw error;
        }
      }
    }

    console.log("");
  }

  console.log(
    `${isDryRun ? "Dry run summary" : "Done"}: ` +
      `${deletedCount} duplicate(s) ${isDryRun ? "would be deleted" : "deleted"}, ` +
      `${skippedCount} skipped (needs manual review).`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
