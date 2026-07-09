import { IUserDocument } from '../../data/models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}
