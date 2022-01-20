import "reflect-metadata";
import { createConnection, EntityManager, getCustomRepository, getManager } from "typeorm";
import { Project } from "./entity/Project";
import { User } from "./entity/User";
import ProjectRepository from "./repository/project-repository";
import UserRepository from "./repository/user-repository";

createConnection().then(async connection => {

    console.log("Inserting a new user into the database...");
    const user = new User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age = 25;
    await connection.manager.save(user);
    console.log("Saved a new user with id: " + user.id);

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);

    // 1. use repository got from entity manager
    getManager().transaction(async (entityManager: EntityManager) => {
        const repository = entityManager.getCustomRepository(UserRepository)
        const user2 = new User()
        user2.firstName = "Mike";
        user2.lastName = "Tison";
        user2.age = 35;
        await repository.save(user2);

        const projectRepository = entityManager.getCustomRepository(ProjectRepository)
        throw new Error(`this transaction will be rollbacked and user ${user2.lastName} wont be registered.`)
    })

    // 2. use repository not got from entity manager
    getManager().transaction(async (entityManager: EntityManager) => {
        const repository = getCustomRepository(UserRepository)
        const user2 = new User()
        user2.firstName = "Mike";
        user2.lastName = "Tison";
        user2.age = 35;
        // this will NOT be rollbacked because repository from getCustomRepository is used.
        await repository.save(user2);

        const projectRepository = entityManager.getCustomRepository(ProjectRepository)
        const project = new Project()
        project.name = "Secret Project"
        // this will be rollbacked because repository from entityManager is used.
        await projectRepository.save(project)

        throw new Error(`this transaction will be fully rollbacked and user ${user2.lastName} will be registered.`)
    })

}).catch(error => console.log(error));
