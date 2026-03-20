import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all teams with payment_status = true (done)
    const teams = await prisma.teams.findMany({
      where: {
        payment_status: true,
      },
      include: {
        startups: {
          select: {
            startup_id: true,
            name: true,
            base_price: true,
            current_price: true,
            multiplier: true,
          },
        },
      },
      orderBy: {
        team_name: 'asc',
      },
    });

    // Calculate final valuation for each team
    const results = teams.map((team) => {
      let totalProfit = 0;

      // Calculate profit from owned startups
      const startupsDetails = team.startups.map((startup) => {
        const basePrice = Number(startup.base_price) || 0;
        const purchasePrice = Number(startup.current_price) || 0;
        const multiplier = parseFloat(startup.multiplier) || 1;
        
        // Calculate final value: base_price * multiplier
        const finalValue = basePrice * multiplier;
        
        // Only count profit if final value > purchase price
        let profit = 0;
        if (finalValue > purchasePrice) {
          profit = finalValue - purchasePrice;
          totalProfit += profit;
        }

        return {
          startup_id: Number(startup.startup_id),
          name: startup.name,
          base_price: basePrice,
          purchase_price: purchasePrice,
          multiplier: multiplier,
          final_value: finalValue,
          profit: profit,
          is_profitable: finalValue > purchasePrice,
        };
      });

      // Calculate 25% of remaining wallet
      const remainingWallet = Number(team.wallet) || 0;
      const walletBonus = remainingWallet * 0.25;

      // Final valuation = total profit + 25% of remaining wallet
      const finalValuation = totalProfit + walletBonus;

      return {
        team_id: Number(team.team_id),
        team_name: team.team_name,
        captain_name: team.captain_name,
        wallet: remainingWallet,
        startups: startupsDetails,
        total_profit: totalProfit,
        wallet_bonus: walletBonus,
        final_valuation: finalValuation,
      };
    });

    // Sort by final valuation (highest first)
    results.sort((a, b) => b.final_valuation - a.final_valuation);

    // Add rank
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
