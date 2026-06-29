import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT || 4000;
async function main() {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        app.listen(port, () => {
            console.log(`The server is running on port http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Error in main function: ", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();