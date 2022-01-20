import { EntityRepository, Repository } from "typeorm";
import { Project } from "../entity/Project";

@EntityRepository(Project)
export default class ProjectRepository extends Repository<Project> {}