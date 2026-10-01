import { crewRepository } from "../repositories/CrewRepository";
import type { Crew } from "../models/Crew";

export const crewService = {
  list: (): Crew[] => crewRepository.findAll(),
  create: (row: Omit<Crew, "id">): Crew => crewRepository.save(row)
};
