import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const createOffer = async (data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>) => {
  return prisma.offer.create({
    data: {
      ...data,
      isActive: data.isActive || true,
    },
  });
};

export const updateOffer = async (id: string, data: Partial<Offer>) => {
  return prisma.offer.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

export const deleteOffer = async (id: string) => {
  return prisma.offer.delete({
    where: { id },
  });
};

export const getOffer = async (id: string) => {
  return prisma.offer.findUnique({
    where: { id },
  });
};

export const getAllOffers = async (filters: { isActive?: boolean } = {}) => {
  return prisma.offer.findMany({
    where: {
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
