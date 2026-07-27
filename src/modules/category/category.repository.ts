import { prisma } from '../../configs/prisma';

export class CategoryRepository {
    async findAll() {
        return prisma.category.findMany({
            orderBy: {
                name : "asc",
            },
        });
    }
}