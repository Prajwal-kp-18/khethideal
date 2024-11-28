import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import clientPromise from "@/lib/mongodb";
import BuyerMarketPlaceSub from "@/models/buyermarketplacesub.js";
import FarmerMarketPlaceSub from "@/models/farmermarketplace";
import buyerMarketPlaceSub from "@/models/buyermarketplacesub.js";
// added collaborator try 2
// import { NextResponse } from "next/server.js";
import { auth } from "../../../../auth";
export async function GET() {
  const session = await auth();

  // Get the role of the current user
  const role = session?.user.role?.toLowerCase();

  console.log(role);

  try {
    let locations;

    // If the role is buyer, get all the coordinates of farmers
    if (role === "buyer") {
      locations = await db.user.findMany({
        where: { role: "farmer" }, // Filter to get only farmers
        select: {
          latitude: true,
          longitude: true,
          id: true,
        },
      });
    } else {
      // Otherwise, return all coordinates (or based on your other requirements)
      locations = await db.user.findMany({
        where: { role: "buyer" },
        select: {
          latitude: true,
          longitude: true,
          id: true,
        },
      });
    }
    console.log(locations);
    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return NextResponse.json(
      { error: "Error fetching coordinates" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // console.log("hello");
  await clientPromise();
  // console.log("hello");
  try {
    interface Details {
      location?: string;
      paymentTerms?: string;
      category?: string;
      minimumQuantity?: number;
      userType?: string;
    }

    // Define a type for the query object
    type Query = {
      location?: string;
      paymentTerms?: string;
      category?: string;
      minimumQuantity?: number;
    };
    type User = {
      userType?: string;
    };

    const details: Details = await req.json();

    // Initialize an empty query object
    let query: Query = {};
    let user: User = {};

    // Add fields to the query only if they are present in `details`
    if (details.location) {
      query.location = details.location;
    }
    if (details.paymentTerms) {
      query.paymentTerms = details.paymentTerms;
    }
    if (details.category) {
      query.category = details.category;
    }
    if (details.minimumQuantity) {
      query.minimumQuantity = details.minimumQuantity;
    }
    if (details.userType) {
      user.userType = details.userType;
    }

    // Execute the query with the constructed query object
    // console.log(query);
    const collection =
      user.userType === "farmer" ? BuyerMarketPlaceSub : FarmerMarketPlaceSub;
    console.log("Query", query);
    console.log("Collection", collection);

    // Execute the query with the selected collection
    const document = await collection.find(query);
    // console.log("casccsdcs", document);
    const mainIds = document.map((doc) => doc.mainId);
    // Proceed if the document is found and has results
    if (document.length > 0) {
      const locations = await db.user.findMany({
        where: {
          id: {
            in: mainIds, // Use the array of mainIds
          },
        },
        select: {
          latitude: true,
          longitude: true,
          id: true,
        },
      });
      console.log(locations);
      return new Response(JSON.stringify(locations), { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
