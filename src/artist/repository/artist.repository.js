import { prisma } from "../../db.config.js"

export const ArtistRepository = {
  async findArtistById(artistId) {
    return await prisma.artist.findUnique({
      where: {
        id: artistId,
      },
    });
  },
}