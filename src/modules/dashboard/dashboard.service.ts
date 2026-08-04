import { PrismaClient, TransactionStatus, Prisma } from "@prisma/client";
import { TransactionService } from "../transaction/transaction.service";

const prisma = new PrismaClient();
const transactionService = new TransactionService();

export interface DashboardStatsFilters {
  conferenceId?: number;
  year?: number;
  month?: number;
  day?: number;
}

export interface GetEventsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export class DashboardService {
  static async getDashboardStats(
    organizerId: number,
    filters?: DashboardStatsFilters
  ) {
    const whereClause: Prisma.TransactionWhereInput = {
      conference: {
        organizerId: organizerId,
      },
      status: TransactionStatus.APPROVED,
    };

    if (filters?.conferenceId) {
      whereClause.conferenceId = filters.conferenceId;
    }

    if (filters?.year) {
      const y = filters.year;
      const m = filters.month ? filters.month - 1 : 0;
      const d = filters.day || 1;

      let startDate: Date;
      let endDate: Date;

      if (filters.day && filters.month) {
        startDate = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
      } else if (filters.month) {
        startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      } else {
        startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      }

      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.transaction.aggregate({
      _sum: {
        totalPrice: true,
        quantity: true,
      },
      where: whereClause,
    });

    return {
      totalRevenue: transactions._sum.totalPrice ?? 0,
      totalTicketsSold: transactions._sum.quantity ?? 0,
    };
  }

  static async getMonthlyChartData(organizerId: number, year: number) {
    const transactions = await prisma.transaction.findMany({
      where: {
        conference: { organizerId },
        status: TransactionStatus.APPROVED,
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
        },
      },
      select: { createdAt: true, totalPrice: true },
    });

    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      totalRevenue: 0,
    }));

    transactions.forEach((tx) => {
      const monthIndex = new Date(tx.createdAt).getMonth();
      monthlyData[monthIndex].totalRevenue += tx.totalPrice;
    });

    return monthlyData;
  }

  static async getOrganizerEvents(organizerId: number, query: GetEventsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 10);
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ConferenceWhereInput = {
      organizerId,
      ...(query.search && {
        title: { contains: query.search, mode: "insensitive" },
      }),
    };

    const [events, totalEvents] = await Promise.all([
      prisma.conference.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          category: { select: { name: true } },
          ticketTypes: true,
          _count: { select: { transactions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.conference.count({ where: whereClause }),
    ]);

    return {
      events,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        limit,
      },
    };
  }

  static async getOrganizerTransactions(organizerId: number) {
    const dueTransactions = await prisma.transaction.findMany({
      where: {
        conference: { organizerId },
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { lt: new Date() },
      },
      select: { id: true },
    });

    for (const { id } of dueTransactions) {
      await transactionService.expireTransactionIfDue(id);
    }

    return prisma.transaction.findMany({
      where: { conference: { organizerId } },
      include: {
        conference: { select: { title: true } },
        ticketType: { select: { name: true } },
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getDetailedTransactions(
    organizerId: number,
    filters?: DashboardStatsFilters
  ) {
    const whereClause: Prisma.TransactionWhereInput = {
      conference: { organizerId },
      status: TransactionStatus.APPROVED,
    };

    if (filters?.conferenceId) {
      whereClause.conferenceId = filters.conferenceId;
    }

    if (filters?.year) {
      const y = filters.year;
      const m = filters.month ? filters.month - 1 : 0;
      const d = filters.day || 1;

      let startDate: Date;
      let endDate: Date;

      if (filters.day && filters.month) {
        startDate = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
      } else if (filters.month) {
        startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      } else {
        startDate = new Date(Date.UTC(y, 0, 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
      }

      whereClause.createdAt = { gte: startDate, lte: endDate };
    }

    return await prisma.transaction.findMany({
      where: whereClause,
      include: {
        conference: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}