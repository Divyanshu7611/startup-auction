import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
    try {
        const {captain_email, password} = await request.json();

        if (!captain_email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const checkUser = await prisma.teams.findUnique({
            where: { captain_email: captain_email}
        })

        if (!checkUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        const checkPassword = await bcrypt.compare(password, checkUser.password_hash);

        if (!checkPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }


        const teamDetails = await prisma.teams.findUnique({
            where: { captain_email: captain_email},
            select: {
                captain_name: true,
                team_name: true,
                contact_number: true,
                team_members: true,
                wallet: true,
                reserved_amount: true,
                final_portfolio_value: true,
                payment_status: true,
                created_at: true,
            }
        })

        if (!teamDetails) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Login successful", teamDetails }, { status: 200 });

    }
    catch (error) {
        console.error("Error fetching team details:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}