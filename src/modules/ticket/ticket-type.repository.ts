import { Prisma } from "@prisma/client";
import { prisma } from "../../configs/prisma";
import { TicketTypeQuery } from "./ticket-type.interface";

export class TicketTypeRepository {
    async create(data: Prisma.TicketTypeCreateInput) {
        return prisma.ticketType.create({
            data,
        });
    }
    async findById(id: number) {
        return prisma.ticketType.findUnique({
            where: {
                id,
            },
        });
    }
    async findAllByConference(
        conferenceId: number,
        query: TicketTypeQuery & { skip: number }
    ) {
        const where: Prisma.TicketTypeWhereInput = {
            conferenceId,
        };

        const [data, total] = await prisma.$transaction([
            prisma.ticketType.findMany({
                where,
                skip: query.skip,
                take: query.limit,
                orderBy: {
                    id: "desc",
                },
            }),
            prisma.ticketType.count({
                where,
            }),
        ]);

        return {
            data,
            total,
        };
    }

    async update(id: number, data: Prisma.TicketTypeUpdateInput) {
        return prisma.ticketType.update({
            where: {
                id,
            },
            data
        })
    }
    async delete(id: number) {
        return prisma.ticketType.delete({
            where: {
                id,
            },
        });
    }
}