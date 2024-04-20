import { login } from "../controllers/UserController";

export const getUserInfo = async (username: string, password: string) => {
  return await login(username, password);
};
