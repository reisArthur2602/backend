import type { Request, Response } from "express";
import z from "zod";
import { createUserService } from "./services/create.js";
import { sessionUserService } from "./services/session.js";
import { detailsUserService } from "./services/details.js";

export const createUserController = async (
  request: Request,
  response: Response
) => {
  const { email, password, name } = z
    .object({
      email: z
        .string({ message: "O email é um campo obrigatório" })
        .email("Insira um formato de email válido")
        .trim(),
      password: z.string().min(6, {
        message: "A senha deve ter no mínimo 6 caracteres",
      }),
      name: z
        .string({ message: "O nome é um campo obrigatório" })
        .min(6, {
          message: "O nome deve ter no mínimo 6 caracteres",
        })
        .trim()
        .lowercase(),
    })
    .parse(request.body);

  const { user } = await createUserService({ email, password, name });

  return response.status(201).json(user);
};

export const sessionUserController = async (
  request: Request,
  response: Response
) => {
  const { email, password } = z
    .object({
      email: z
        .string({ message: "O email é um campo obrigatório" })
        .email("Insira um formato de email válido")
        .trim(),
      password: z.string().min(6, {
        message: "A senha deve ter no mínimo 6 caracteres",
      }),
    })
    .parse(request.body);

  const { user, accessToken } = await sessionUserService({ email, password });

  return response.status(200).json({ user, accessToken });
};

export const detailsUserController = async (
  request: Request,
  response: Response
) => {
  const user_id = request.user_id;

  const { user } = await detailsUserService({ user_id });

  return response.status(200).json({ user });
};
