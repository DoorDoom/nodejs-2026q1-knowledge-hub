import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, Status } from 'generated/prisma/client';
import { Pool } from 'pg';
import { generatePasswordHash } from 'src/utils/hash';

class PrismaService extends PrismaClient {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }
}

console.log('Starting seed script...');

const prisma = new PrismaService();

async function main() {
  const categories = await prisma.$transaction(
    [
      {
        name: 'Tech',
        description: 'Technology articles',
      },
      {
        name: 'Home',
        description: 'Home articles',
      },
      {
        name: 'Geek',
        description: 'Geek articles',
      },
    ].map((category) =>
      prisma.category.create({
        data: category,
      }),
    ),
  );

  const users = await prisma.$transaction(
    [
      {
        login: 'admin',
        password: 'hashed-password',
        role: 'ADMIN' as Role,
      },
      {
        login: 'editor',
        password: 'hashed-password123',
        role: 'EDITOR' as Role,
      },
    ].map((user) =>
      prisma.user.create({
        data: { ...user, password: generatePasswordHash(user.password) },
      }),
    ),
  );

  const tags = await prisma.$transaction(
    [
      { name: 'nestjs' },
      { name: 'prisma' },
      { name: 'typescript' },
      { name: 'javascript' },
      { name: 'nodejs' },
    ].map((tag) =>
      prisma.tag.create({
        data: tag,
      }),
    ),
  );

  const articles = await prisma.$transaction(
    [
      {
        title: 'Getting Started with Prisma',
        content:
          "Prisma is a next-generation **ORM (Object-Relational Mapper)** for Node.js and TypeScript. It makes database access easy, type-safe, and efficient.\n\nThis guide will help you set up Prisma from scratch using **SQLite** (so you don't need to install a database server like PostgreSQL or MySQL right away).\n\n---\n\n### 1. Prerequisites\n- Node.js installed on your machine.\n- A basic understanding of JavaScript or TypeScript.\n\n---\n\n### 2. Initialize your Project\nCreate a new directory and initialize a Node.js project:\n\n```bash\nmkdir prisma-demo\ncd prisma-demo\nnpm init -y\n```\n\nInstall the Prisma CLI as a development dependency:\n\n```bash\nnpm install prisma --save-dev\n```\n\n---\n\n### 3. Initialize Prisma\nRun the following command to set up the Prisma folder structure:\n\n```bash\nnpx prisma init --datasource-provider sqlite\n```\n\n**What this creates:**\n1.  A `prisma` folder containing `schema.prisma` (This is the heart of your project).\n2.  A `.env` file for your database connection string.\n\n---\n\n### 4. Define your Data Model\nOpen `prisma/schema.prisma`. This is where you define what your database tables look like. Let's create a simple **User** and **Post** model.\n\n```prisma\n// prisma/schema.prisma\n\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\ndatasource db {\n  provider = \"sqlite\"\n  url      = \"file:./dev.db\"\n}\n\nmodel User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  posts Post[]\n}\n\nmodel Post {\n  id        Int     @id @default(autoincrement())\n  title     String\n  content   String?\n  published Boolean @default(false)\n  author    User    @relation(fields: [authorId], references: [id])\n  authorId  Int\n}\n```\n\n---\n\n### 5. Run a Migration\nA migration does two things: it creates the actual tables in your database and generates the **Prisma Client** (the code you use to talk to the DB).\n\nRun this command:\n```bash\nnpx prisma migrate dev --name init\n```\n\n---\n\n### 6. Install and Use Prisma Client\nNow that the database is ready, you need the Prisma Client package to write queries.\n\n```bash\nnpm install @prisma/client\n```\n\nCreate a file named `script.js` (or `index.js`) and add the following code:\n\n```javascript\nconst { PrismaClient } = require('@prisma/client');\nconst prisma = new PrismaClient();\n\nasync function main() {\n  // 1. Create a new user and a post in one go\n  const newUser = await prisma.user.create({\n    data: {\n      name: 'Alice',\n      email: 'alice@example.com',\n      posts: {\n        create: { title: 'Hello World' },\n      },\n    },\n  });\n  console.log('Created User:', newUser);\n\n  // 2. Fetch all users including their posts\n  const allUsers = await prisma.user.findMany({\n    include: { posts: true },\n  });\n  console.dir(allUsers, { depth: null });\n}\n\nmain()\n  .catch((e) => console.error(e))\n  .finally(async () => {\n    await prisma.$disconnect();\n  });\n```\n\nRun your script:\n```bash\nnode script.js\n```\n\n---\n\n### 7. Explore your Data (Prisma Studio)\nPrisma comes with a built-in GUI to view and edit your data. It’s like a mini admin panel.\n\nRun:\n```bash\nnpx prisma studio\n```\nThis will open a browser window at `http://localhost:5555` where you can manually add, delete, or edit records.\n\n---\n\n### Key Concepts Summary\n*   **`schema.prisma`**: The single source of truth for your database schema.\n*   **`prisma migrate`**: Synchronizes your schema with the database.\n*   **Prisma Client**: An auto-generated and type-safe query builder for Node.js.\n*   **Prisma Studio**: A GUI to explore your data.\n\n### Next Steps\n1.  **TypeScript:** Prisma is best used with TypeScript because it provides full auto-completion for your database models.\n2.  **External DBs:** To use PostgreSQL or MySQL, just change the `provider` and `url` in `schema.prisma`.\n3.  **Relationships:** Learn more about 1-to-1, 1-to-many, and many-to-many relationships in the [Prisma Docs](https://www.prisma.io/docs).",
        authorId: users[0].id,
        categoryId: categories[0].id,
        status: 'PUBLISHED' as Status,
        tags: {
          connectOrCreate: [tags[1].id, tags[2].id].map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      {
        title: 'Building a REST API with NestJS',
        content:
          '**NestJS** is a progressive Node.js framework for building efficient, reliable, and scalable server-side applications. It has become incredibly popular because it brings architectural order to the Node.js world, heavily inspired by **Angular**.\n\nHere is a breakdown of the basics of NestJS.\n\n---\n\n### 1. The Core Philosophy\nNestJS is built with and fully supports **TypeScript**. It provides an "out-of-the-box" application architecture that allows developers to create highly testable, scalable, and easily maintainable applications.\n\nUnder the hood, Nest makes use of robust HTTP Server frameworks like **Express** (default) or **Fastify**.\n\n---\n\n### 2. The Three Main Pillars\nAlmost everything in NestJS revolves around three core concepts: **Modules**, **Controllers**, and **Providers**.\n\n#### A. Modules (`@Module`)\nModules are the basic building blocks of a NestJS app. Every application has at least one **Root Module**. They are used to organize code into logical boundaries (e.g., a `UsersModule`, `AuthModule`, `ProductModule`).\n*   **Purpose:** Group related controllers and providers together.\n\n#### B. Controllers (`@Controller`)\nControllers are responsible for handling incoming **requests** and returning **responses** to the client. They are tied to specific routes. {\n      @Get()\n      findAll(): stringmC. Providers / Services (`@Injectable`)\nProviders are perhaps the most important concept. Most things (Services, Repositories, Factories) are treated as providers. A **Service** is a provider used to handle complex business logic, such as fetching data from a database.\n*   **Purpose:** Keep logic out of the controller so it can be reused across the app.\n\n---\n\n### 3. Dependency Injection (DI)\nNestJS is built around a powerful design pattern called **Dependency Injection**. Instead of manually creating instances of classes (e.g., `const service = new UserService()`), Nest handles the "instantiation" for you.\n\nYou simply "ask" for a service in a class constructor:\n```typescript\nconstructor(private userService: UserService) {}\n```\nNest finds the `UserService`, creates it, and gives it to your controller automatically.\n\n---\n\n### 4. Decorators\nNestJS makes heavy use of **Decorators** (those words starting with `@`). They provide metadata to the compiler.\n*   `@Module()`: Defines a module.\n*   `@Controller(`path`)`: Defines a route prefix.\n*   `@Get()`, `@Post()`, `@Put()`, `@Delete()`: Define HTTP methods.\n*   `@Body()`, `@Param()`, `@Query()`: Access request data.\n\n---\n\n### 5. Pipes, Guards, and Interceptors\nNest offers specialized tools to handle common tasks:\n*   **Pipes:** Used for **validation** and **transformation** (e.g., ensuring an ID is a number).\n*   **Guards:** Used for **authentication** and **authorization** (e.g., "Is this user logged in?").\n*   **Interceptors:** Used to transform the response or bind extra logic before/after a function execution (e.g., logging or mapping data).\n\n---\n\n### 6. The Nest CLI\nNest comes with a powerful Command Line Interface (CLI) that automates your workflow.\n\n*   **Install CLI:** `npm i -g @nestjs/cli`\n*   **Create new project:** `nest new project-name`\n*   **Generate a new controller:** `nest g controller users`\n*   **Generate a service:** `nest g service users`\n\n---\n\n### 7. Why use NestJS?\n1.  **TypeScript:** Benefits from strong typing and modern JS features.\n2.  **Structure:** Unlike Express, which is "unopinionated" (you decide the folder structure), Nest tells you exactly where things should go. This is great for large teams.\n3.  **Powerful Ecosystem:** It has built-in support for Microservices, WebSockets, GraphQL, TypeORM, and Mongoose.\n4.  **Testability:** Because of Dependency Injection, it is very easy to swap out real database services for "mock" services during testing.\n\n### Summary Checklist for Beginners\n1.  Learn **TypeScript** basics.\n2.  Understand the **Module-Controller-Service** flow.\n3.  Practice using the **Nest CLI** to generate code.\n4.  Learn how to use **DTOs** (Data Transfer Objects) with **class-validator** to handle incoming data safely.',
        authorId: users[1].id,
        categoryId: categories[0].id,
        status: 'DRAFT' as Status,
        tags: {
          connectOrCreate: [tags[0].id, tags[4].id].map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      {
        title: 'TypeScript Best Practices',
        content:
          'TypeScript has become the industry standard for scalable JavaScript development. To get the most out of it, you need to move beyond just adding `: string` to your variables.\n\nHere is a comprehensive guide to **TypeScript Best Practices**, categorized by importance.\n\n---\n\n### 1. Configuration: The "Strict" Foundation\nThe strength of TypeScript depends entirely on your `tsconfig.json`.\n\n*   **Enable `strict` mode:** This is non-negotiable. It enables a suite of checks (like `noImplicitAny` and `strictNullChecks`) that prevent common bugs.\n    ```json\n    // tsconfig.json\n    {\n      "compilerOptions": {\n        "strict": true,\n        "noImplicitReturns": true,\n        "noFallthroughCasesInSwitch": true\n      }\n    }\n    ```\n*   **Use `noImplicitAny: true`:** This forces you to define types when TypeScript cannot infer them, preventing "lazy" code that bypasses the type checker.\n\n---\n\n### 2. Type Safety: Avoiding the "Escape Hatches"\nThe goal of TypeScript is to provide type safety. Don\'t fight the compiler; work with it.\n\n*   **Avoid `any` at all costs:** Using `any` tells the compiler to stop checking that variable. It is essentially turning off TypeScript.\n*   **Use `unknown` instead of `any`:** If you truly don\'t know the type (e.g., from an external API), use `unknown`. It forces you to perform type checking (narrowing) before interacting with the value.\n    ```typescript\n    function processData(data: unknown) {\n      if (typeof data === "string") {\n        console.log(data.toUpperCase()); // Safe\n      }\n    }\n    ```\n*   **Use `as const` for literal types:** This creates read-only, specific types instead of widening them to `string` or `number`.\n    ```typescript\n    const COLORS = [\'red\', \'blue\', \'green\'] as const;\n    type Color = typeof COLORS[number]; // "red" | "blue" | "green"\n    ```\n\n---\n\n### 3. Type Modeling: Interfaces vs. Types\nA common question is whether to use `interface` or `type`.\n\n*   **Use `interface` for objects and classes:** They are better for performance and allow for "declaration merging" (extending existing interfaces).\n*   **Use `type` for unions, intersections, and aliases:** \n    ```typescript\n    type Status = "loading" | "success" | "error"; // Union\n    type Point = { x: number } & { y: number };   // Intersection\n    ```\n*   **Be consistent:** Choose a style for your project and stick to it.\n\n---\n\n### 4. Functions & Documentation\n*   **Explicitly define return types:** While TS can infer them, explicit return types prevent accidental changes to the function\'s output and make the code easier to read.\n    ```typescript\n    function add(a: number, b: number): number {\n      return a + b;\n    }\n    ```\n*   **Use Object Destructuring for parameters:** If a function takes more than two arguments, use an object. This makes it easier to add optional parameters later and improves readability.\n    ```typescript\n    interface Config {\n      id: string;\n      retries: number;\n    }\n    function initialize({ id, retries }: Config) { ... }\n    ```\n\n---\n\n### 5. Leveraging Advanced Features\n*   **Use Discriminated Unions:** This is the most powerful pattern for handling state or different types of data.\n    ```typescript\n    interface Success { status: \'success\'; data: string; }\n    interface Failed { status: \'failed\'; error: Error; }\n\n    type Result = Success | Failed;\n\n    function handle(result: Result) {\n      if (result.status === \'success\') {\n        console.log(result.data); // TS knows this is Success\n      }\n    }\n    ```\n*   **Utility Types:** Don\'t rewrite types. Use built-ins:\n    *   `Partial<T>`: Makes all properties optional.\n    *   `Pick<T, Keys>`: Choose specific properties.\n    *   `Omit<T, Keys>`: Remove specific properties.\n    *   `Readonly<T>`: Prevent mutation.\n*   **Type Guards (`is` keyword):** Create custom functions to narrow types reliably.\n    ```typescript\n    function isUser(obj: any): obj is User {\n      return \'username\' in obj;\n    }\n    ```\n\n---\n\n### 6. Enums vs. Const Objects\n*   **Prefer `as const` or String Unions over Enums:** Standard Enums in TypeScript have some weird behaviors (especially numeric ones) and generate extra code in the compiled JavaScript.\n    ```typescript\n    // Better than enum\n    export const Status = {\n      Pending: \'pending\',\n      Active: \'active\',\n    } as const;\n\n    type StatusType = typeof Status[keyof typeof Status];\n    ```\n\n---\n\n### 7. Clean Code & Tooling\n*   **Use Project References:** In large monorepos, use the `references` field in `tsconfig` to break the project into smaller, faster-compiling chunks.\n*   **Naming Conventions:**\n    *   Use **PascalCase** for types, interfaces, and classes.\n    *   Use **camelCase** for variables and functions.\n    *   Avoid the `I` prefix for interfaces (e.g., use `User`, not `IUser`). This is an outdated convention from C#.\n*   **ESLint & Prettier:** Use `@typescript-eslint/recommended` to catch common pitfalls like floating promises or incorrect type usage.\n\n---\n\n### Summary Checklist\n1. [ ] Is `strict` mode on?\n2. [ ] Are there any `any` types that could be `unknown` or a specific interface?\n3. [ ] Are function return types explicitly defined?\n4. [ ] Are you using `as const` for fixed configurations?\n5. [ ] Are you using Discriminated Unions for complex states?',
        authorId: users[0].id,
        categoryId: categories[2].id,
        status: 'PUBLISHED' as Status,
      },
      {
        title: 'JavaScript Performance Tips',
        content:
          'Improving JavaScript performance is crucial for creating smooth, responsive user experiences. Performance optimization can be broken down into **Execution Speed**, **Memory Management**, and **Rendering Efficiency**.\n\nHere are the most effective JavaScript performance tips categorized by their impact:\n\n---\n\n### 1. Optimize DOM Manipulation (The Biggest Bottleneck)\nThe DOM is much slower than JavaScript execution. Interacting with it frequently causes "Layout Thrashing."\n\n*   **Batch DOM Updates:** Use a `DocumentFragment` to group multiple changes before adding them to the live DOM.\n    ```javascript\n    const fragment = document.createDocumentFragment();\n    items.forEach(text => {\n      const li = document.createElement(\'li\');\n      li.textContent = text;\n      fragment.appendChild(li);\n    });\n    document.getElementById(\'list\').appendChild(fragment);\n    ```\n*   **Minimize Reflows:** Avoid reading layout properties (like `offsetWidth`, `getComputedStyle`) immediately after writing them. This forces the browser to recalculate the layout mid-script.\n*   **Use `requestAnimationFrame` for Animations:** Instead of `setTimeout` or `setInterval`, use `requestAnimationFrame` to sync your code with the browser’s refresh rate (usually 60fps).\n\n### 2. Efficient Event Handling\n*   **Event Delegation:** Instead of attaching an event listener to every single list item, attach one listener to the parent and check the `event.target`.\n*   **Throttle and Debounce:** Limit how often a function runs during high-frequency events like `scroll`, `resize`, or `keyup`.\n    *   **Debounce:** Wait until the user *stops* typing.\n    *   **Throttle:** Run the code at most once every *X* milliseconds.\n\n### 3. Execution & Logic Optimization\n*   **Use `Map` and `Set` for Lookups:** If you need to search through large datasets frequently, `Map` and `Set` are significantly faster than Objects or Arrays for lookups ($O(1)$ vs $O(n)$).\n*   **Avoid `eval()` and `with`:** These prevent the JavaScript engine (V8) from optimizing your code, as they make the scope unpredictable.\n*   **Cache Array Length:** In standard `for` loops, cache the length so the property isn\'t re-accessed every iteration.\n    ```javascript\n    for (let i = 0, len = arr.length; i < len; i++) { ... }\n    ```\n*   **Use Web Workers for Heavy Tasks:** For CPU-intensive tasks (image processing, heavy math), use Web Workers to run code on a separate thread, keeping the UI responsive.\n\n### 4. Memory Management\n*   **Remove Event Listeners:** If you create an element and later remove it, make sure to `removeEventListener` to prevent memory leaks.\n*   **Clear Timers:** Always call `clearTimeout()` and `clearInterval()` when they are no longer needed.\n*   **Be Careful with Closures:** Closures can inadvertently keep large objects in memory long after they are needed because a nested function still references them.\n\n### 5. Asynchronous Performance\n*   **Use `Promise.all` for Parallelism:** If you have multiple independent API calls, don\'t `await` them one by one. Run them in parallel.\n    ```javascript\n    // Fast\n    const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);\n    ```\n*   **Lazy Loading:** Use dynamic imports `import()` to load JavaScript modules only when they are actually needed (e.g., when a user clicks a specific tab).\n\n### 6. Loading and Network\n*   **Defer or Async Scripts:** Use `<script defer>` to ensure the script loads in the background and executes only after the HTML is parsed.\n*   **Tree Shaking:** Use modern bundlers (Webpack, Vite, Rollup) to remove unused code (dead code elimination) from your final production build.\n*   **Minification:** Always minify your code (using tools like Terser) to reduce the payload size transferred over the network.\n\n### 7. Modern "Micro-Optimizations" (V8 Engine)\n*   **Keep Objects Consistent:** JavaScript engines optimize "Hidden Classes." Try to initialize all object properties in the constructor and avoid deleting properties (set them to `null` instead) to keep the object shape consistent.\n*   **Avoid "De-optimization":** Passing different types of data (e.g., sometimes a string, sometimes an integer) to the same function can cause the engine to drop into a slower "interpreted" mode rather than optimized machine code.\n\n### Summary Checklist\n1.  **Reduce DOM access** (use fragments and batching).\n2.  **Debounce** scroll and resize events.\n3.  **Offload heavy math** to Web Workers.\n4.  **Parallelize** API calls with `Promise.all`.\n5.  **Audit memory** leaks (listeners and timers).\n6.  **Use Chrome DevTools** (Performance tab) to find specific bottlenecks.',
        authorId: users[1].id,
        categoryId: categories[1].id,
        status: 'ARCHIVED' as Status,
      },
      {
        title: 'Node.js Best Practices',
        content:
          "Node.js is powerful, but because it is unopinionated, it is easy to write messy, unmaintainable code. Following best practices ensures your application is scalable, secure, and easy to debug.\n\nHere is a comprehensive guide to Node.js best practices, categorized by area.\n\n---\n\n### 1. Project Structure & Architecture\nAvoid the \"flat\" structure where everything is in one folder. Use a **layered architecture** to separate concerns.\n\n*   **Folder Structure:** Separate your logic into:\n    *   `controllers/`: Request handling and status codes.\n    *   `services/`: Business logic (where the heavy lifting happens).\n    *   `models/`: Database schemas.\n    *   `routes/`: API endpoint definitions.\n    *   `middlewares/`: Request interceptors (auth, validation).\n*   **Separation of Concerns:** Keep your `app.js` (Express config) separate from `server.js` (network connection). This makes testing easier without starting a network server.\n\n---\n\n### 2. Error Handling\nProper error handling prevents your server from crashing and helps you find bugs faster.\n\n*   **Use Async/Await and Try-Catch:** Avoid \"Callback Hell.\"\n*   **Extend the Error Class:** Create a custom `AppError` class that includes a `statusCode` and an `isOperational` flag.\n*   **Centralized Error Handling:** Use an Express error-handling middleware at the end of your route definitions.\n    ```javascript\n    app.use((err, req, res, next) => {\n      res.status(err.statusCode || 500).json({ message: err.message });\n    });\n    ```\n*   **Catch Uncaught Exceptions:** Always listen for `uncaughtException` and `unhandledRejection` to log the error and perform a graceful shutdown.\n\n---\n\n### 3. Code Style & Quality\n*   **Use ESLint & Prettier:** Standardize your code format across the team.\n*   **Use `const` and `let`:** Never use `var`.\n*   **Name functions clearly:** `getUserById` is better than `fetchData`.\n*   **Use Arrow Functions:** For shorter syntax and lexical `this` binding, though use regular functions for methods inside objects/classes.\n\n---\n\n### 4. Security Best Practices\nNode.js applications are often targets for attacks.\n\n*   **Use Helmet:** It sets various HTTP headers to secure your app from common attacks.\n    ```javascript\n    const helmet = require('helmet');\n    app.use(helmet());\n    ```\n*   **Sanitize Inputs:** Prevent SQL Injection and Cross-Site Scripting (XSS) by validating and sanitizing user input (use libraries like `joi` or `express-validator`).\n*   **Environment Variables:** Never hardcode secrets. Use `.env` files (via `dotenv`) and add them to `.gitignore`.\n*   **NPM Audit:** Regularly run `npm audit` to find and fix vulnerabilities in your dependencies.\n*   **Limit Request Size:** Prevent DoS attacks by limiting the body size.\n    ```javascript\n    app.use(express.json({ limit: '10kb' }));\n    ```\n\n---\n\n### 5. Performance & Scalability\n*   **Don't Block the Event Loop:** Node is single-threaded. Never perform heavy CPU tasks (like image processing or large loops) in the main thread. Offload them to **Worker Threads** or a background job queue (like **BullMQ**).\n*   **Use Gzip Compression:** Reduce the size of the response body.\n    ```javascript\n    const compression = require('compression');\n    app.use(compression());\n    ```\n*   **Run in Parallel:** Use `Promise.all()` when you have multiple independent asynchronous tasks.\n*   **Use a Process Manager:** Use **PM2** to keep your application alive, restart it after crashes, and manage clustering (using all CPU cores).\n\n---\n\n### 6. Modern Node.js Features (v18+)\n*   **Native Fetch API:** No need for `axios` or `node-fetch` for simple requests.\n*   **Built-in Test Runner:** Node.js now has a built-in test runner (`node --test`).\n*   **Native `.env` support:** In newer versions (v20+), you can use `node --env-file=.env index.js` without needing the `dotenv` package.\n\n---\n\n### 7. Testing\n*   **Write Unit Tests:** Test individual functions in isolation (using **Jest** or **Vitest**).\n*   **Integration Tests:** Test how your components work together (e.g., API endpoint $\\rightarrow$ Service $\\rightarrow$ DB). Use **Supertest** for testing HTTP routes.\n*   **AAA Pattern:** Organize tests by **Arrange, Act, Assert**.\n\n---\n\n### 8. Production Readiness\n*   **Logging:** Don't use `console.log` in production. Use a professional logger like **Winston** or **Pino**, which supports different log levels (info, warn, error) and can write to files or external services.\n*   **Set `NODE_ENV=production`:** This triggers optimizations in many libraries (like Express).\n*   **Graceful Shutdown:** When the server stops, close database connections and finish processing existing requests.\n    ```javascript\n    process.on('SIGTERM', () => {\n      server.close(() => {\n        console.log('Process terminated');\n      });\n    });\n    ```\n\n### Summary Checklist\n1. [ ] Is logic separated into Layers?\n2. [ ] Are secrets in `.env`?\n3. [ ] Is there a centralized error handler?\n4. [ ] Are you using `async/await`?\n5. [ ] Did you run `npm audit`?\n6. [ ] Is **Helmet** installed?\n7. [ ] Are you using a process manager like **PM2**?",
        authorId: users[0].id,
        categoryId: categories[0].id,
        status: 'PUBLISHED' as Status,
        tags: {
          connectOrCreate: [tags[2].id, tags[4].id].map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    ].map((article) =>
      prisma.article.create({
        data: article,
        include: {
          tags: true,
        },
      }),
    ),
  );

  prisma.comment.createMany({
    data: [
      {
        content: 'Great article!',
        authorId: users[0].id,
        articleId: articles[0].id,
      },
      {
        content: 'Thanks for sharing this information.',
        authorId: users[1].id,
        articleId: articles[1].id,
      },
      {
        content: 'Thanks for sharing this information. *)',
        authorId: users[1].id,
        articleId: articles[4].id,
      },
    ],
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
