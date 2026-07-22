import { Prisma } from "@prisma/client";
import { prisma } from "../../configs/prisma";

export class ConferenceRepository {
  async create(data: Prisma.ConferenceCreateInput) {
    return prisma.conference.create({
      data,
    });
  }
  async findById(id:number) {
    return prisma.conference.findUnique({
        where: { 
            id,
         },
    });
  }
  async findAll() {
    return prisma.conference.findMany();
  }
  async update(id: number, data: Prisma.ConferenceUpdateInput) {
    return prisma.conference.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number) {
    return prisma.conference.delete({
      where: {
        id,
      },
    });
  }
}

// export default new ConferenceRepository();