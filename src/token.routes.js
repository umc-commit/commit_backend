import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { signJwt } from './jwt.config.js';
import { StatusCodes } from 'http-status-codes';
import { parseWithBigInt, stringifyWithBigInt } from './bigintJson.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/token', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: 2 },
      include: {
        account: true
      }
    });

    const payload = {
      userId: user.id.toString(),
      nickname: user.nickname,
      accountId: user.accountId.toString(),
      provider: user.account.provider
    };

    const token = signJwt(payload);

    const result = {
      token,
      userId: user.id
    };

    const responseData = parseWithBigInt(stringifyWithBigInt(result));

    res.status(StatusCodes.OK).success(responseData);
  } catch (err) {
    next(err);
  }
});

export default router;
