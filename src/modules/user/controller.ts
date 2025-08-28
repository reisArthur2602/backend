import type { Request, Response } from "express";
import z from "zod";
import { CreateUserService } from "./services/create.js";

export const createUserController = async (
  request: Request,
  response: Response
) => {
  const { email, password } = z
    .object({
      email: z
        .string()
        .min(1, { message: "O email é um campo obrigatório" })
        .email("Insira um formato de email válido")
        .trim(),
      password: z.string().min(6, {
        message: "A senha deve ter no mínimo 6 caracteres",
      }),
    })
    .parse(request.body);

  const { user } = await CreateUserService({ email, password });

  return response.status(201).json(user);
};
