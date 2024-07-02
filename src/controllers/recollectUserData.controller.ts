import { Request, Response} from 'express'
import handleHttpError from '../utils/handleError'

export async function recollectUserData(req: Request, res: Response): Promise<void> {
  try {
    
  } catch (error) {
    handleHttpError(res, 'cannot recollect data')
  }
}