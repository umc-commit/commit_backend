import { prisma } from "../../db.config.js"

export const UserRepository = {
  async findUserById(userId) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  },

  async findArtistById(artistId) {
    return await prisma.artist.findUnique({
      where: {
        id: artistId,
      },
    });
  },
}