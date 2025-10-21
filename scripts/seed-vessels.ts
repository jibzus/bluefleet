import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚢 Seeding vessels...");

  // Get the owner user
  const owner = await prisma.user.findFirst({
    where: { email: "owner@bluefleet.com" },
  });

  if (!owner) {
    console.error("❌ Owner user not found. Please run seed script first.");
    return;
  }

  // Create vessels
  const vessels = [
    {
      slug: "topaz-amani-psv",
      type: "PSV",
      homePort: "Warri, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "Topaz Amani",
        type: "Platform Supply Vessel",
        imoNumber: "9653037",
        yearBuilt: 2013,
        tonnageDwt: 3300,
        ownerOperator: "Team Offshore Nigeria",
        notes: "DP2; Active in Niger Delta",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/49/Platform_Supply_Vessel_Highland_Knight_%28geograph_4425580%29.jpg",
          alt: "Platform supply vessel Highland Knight underway",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "topaz-faye-psv",
      type: "PSV",
      homePort: "Port Harcourt, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "Topaz Faye",
        type: "Platform Supply Vessel",
        imoNumber: "9653038",
        yearBuilt: 2013,
        tonnageDwt: 3300,
        ownerOperator: "Team Offshore Nigeria",
        notes: "700m² deck; Platform supply operations",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Platform_supply_ship_%27Energean_Star%27_%28IMO_9677935%29_on_its_way_to_the_Port_of_Haifa%2C_Israel_-_2023-10-07_%28DSC0986%29.jpg",
          alt: "Platform supply vessel Energean Star heading to Haifa",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "topaz-seema-psv",
      type: "PSV",
      homePort: "Lagos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "Topaz Seema",
        type: "Platform Supply Vessel",
        imoNumber: "9653039",
        yearBuilt: 2014,
        tonnageDwt: 3300,
        ownerOperator: "Team Offshore Nigeria",
        notes: "Conventional PSV layout; 50 bunks",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/6/6a/%27Demarest_Tide%27_platform_supply_ship_in_the_port_of_Haifa%2C_Israel_-_2023-03-11_%28DSC1191%29.jpg",
          alt: "Demarest Tide platform supply ship in Haifa port",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "topaz-sophie-psv",
      type: "PSV",
      homePort: "Bonny, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "Topaz Sophie",
        type: "Platform Supply Vessel",
        imoNumber: "9653040",
        yearBuilt: 2014,
        tonnageDwt: 3300,
        ownerOperator: "Team Offshore Nigeria",
        notes: "Active; Cabotage compliant PSV",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/3/35/MMA_Responder_%28Platform_Supply_Vessel_%29_at_Henderson%2C_September_2020_01.jpg",
          alt: "MMA Responder platform supply vessel at Henderson",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "team-beleuzi-psv",
      type: "PSV",
      homePort: "Lagos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "Team Beleuzi",
        type: "Platform Supply Vessel",
        imoNumber: "9862190",
        yearBuilt: 2019,
        tonnageDwt: 5000,
        ownerOperator: "Team Offshore Nigeria",
        notes: "Wholly Nigerian-owned; DP2 capable",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Platform_Supply_Vessel_E.R._Arendal_on_the_River_Yare.jpg",
          alt: "Platform supply vessel E.R. Arendal on River Yare",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "bende-osv",
      type: "OSV",
      homePort: "Onne, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "BENDE",
        type: "Offshore Support Vessel",
        imoNumber: "9701234",
        yearBuilt: 2012,
        tonnageDwt: 4500,
        ownerOperator: "A.G. Butler Nigeria Ltd.",
        notes: "Platform supply; Active operations",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Offshore_Tug-Supply_Ship_SKANDI_HANDLER._IMO_9246724._12-06-2025_%28d.j.b.%29._01.jpg",
          alt: "Offshore tug supply ship SKANDI HANDLER at berth",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "dsv-avianna-dsv-osv",
      type: "DSV/OSV",
      homePort: "Lagos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "DSV AVIANNA",
        type: "Dive Support / Offshore Support Vessel",
        imoNumber: "9734567",
        yearBuilt: 2015,
        tonnageDwt: 3800,
        ownerOperator: "MarineLink Directory",
        notes: "Dive support; Nigerian flag",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Deep_Arctic_diving_support_vessel_-_geograph.org.uk_-_4979128.jpg",
          alt: "Deep Arctic diving support vessel alongside quay",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "eunice-iii-ahts",
      type: "AHTS",
      homePort: "Port Harcourt, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "EUNICE III",
        type: "Anchor Handling Tug Supply",
        imoNumber: "9456789",
        yearBuilt: 2008,
        tonnageDwt: 6000,
        ownerOperator: "Aquashield Oil & Marine",
        notes: "Anchor handling; In service",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Normand_Master.jpg",
          alt: "AHTS Normand Master in harbor",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "hd-scorpion-osv",
      type: "OSV",
      homePort: "Escravos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "HD SCORPION",
        type: "Offshore Support Vessel",
        imoNumber: "9567890",
        yearBuilt: 2010,
        tonnageDwt: 4200,
        ownerOperator: "VNC Offshore Limited",
        notes: "Utility support; DP2 rated",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Storm_%26_Odyssea_Darwin.jpg",
          alt: "Offshore support vessels Storm and Odyssea Darwin offshore",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "neya-iii-ahts",
      type: "AHTS",
      homePort: "Lagos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "NEYA III",
        type: "Anchor Handling Tug Supply",
        imoNumber: "9789012",
        yearBuilt: 2017,
        tonnageDwt: 5500,
        ownerOperator: "Elshcon Nigeria",
        notes: "Anchor handling specialist",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/1/17/AHTS_Borgstein.JPG",
          alt: "Anchor handling tug supply vessel Borgstein",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "gulmar-condor-dsv-osv",
      type: "DSV/OSV",
      homePort: "Onne, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "Gulmar Condor",
        type: "Dive Support / Offshore Support Vessel",
        imoNumber: "9234567",
        yearBuilt: 2002,
        tonnageDwt: 7000,
        ownerOperator: "Gulmar Offshore / Subsea 7",
        notes: "Upgraded in 2007; Long-term deployment",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Dive_Support_Vessel_Bhagwan_Dryden_at_Jervoise_Bay_Boat_Harbour%2C_June_2020_02.jpg",
          alt: "Dive support vessel Bhagwan Dryden at Jervoise Bay",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
    {
      slug: "latc-psv-3300",
      type: "PSV",
      homePort: "Lagos, Nigeria",
      status: "ACTIVE",
      specs: {
        name: "LATC PSV 3300",
        type: "Platform Supply Vessel",
        imoNumber: "9789012",
        yearBuilt: 2020,
        tonnageDwt: 3300,
        ownerOperator: "LATC Marine",
        notes: "Damen-built PSV with 250m² deck",
        flag: "Nigeria",
      },
      media: [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Platform_supply_vessel_leaving_Montrose_for_the_North_Sea_-_geograph.org.uk_-_6823661.jpg",
          alt: "Platform supply vessel departing Montrose for the North Sea",
          sort: 0,
        },
      ],
      certs: [],
      availability: [],
    },
  ];

  for (const vesselData of vessels) {
    const { media, certs, availability, ...vesselInfo } = vesselData;

    const vessel = await prisma.vessel.create({
      data: {
        ...vesselInfo,
        ownerId: owner.id,
        media: {
          create: media,
        },
        certs: {
          create: certs,
        },
        availability: {
          create: availability,
        },
      },
    });

    console.log(`✅ Created vessel: ${vesselInfo.specs.name} (${vessel.id})`);
  }

  console.log("✅ Vessel seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding vessels:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
