export interface Profile {
    id: string
    name: string
    title: string
    company: string
    location: string
    matchReason: string
    hubId: "shubham" | "ajay"
}

export const MOCK_DB: Profile[] = [
    {
        id: "1",
        name: "Sarah Chen",
        title: "VP of Engineering",
        company: "TechFlow",
        location: "San Francisco, CA",
        matchReason: "Sarah leads a team of 50+ engineers and has experience scaling Series B startups.",
        hubId: "shubham",
    },
    {
        id: "2",
        name: "Michael Ross",
        title: "Founder",
        company: "DataSync",
        location: "New York, NY",
        matchReason: "Michael is a technical founder in the fintech data infrastructure space. He connects with many other founders.",
        hubId: "shubham",
    },
    {
        id: "3",
        name: "Jessica Wu",
        title: "Director of Product",
        company: "CloudScale",
        location: "Remote",
        matchReason: "Jessica has deep expertise in B2B SaaS product management.",
        hubId: "ajay",
    },
    {
        id: "4",
        name: "David Kim",
        title: "Senior Product Designer",
        company: "CreativeStudio",
        location: "Los Angeles, CA",
        matchReason: "David is an award-winning designer specializing in mobile UX.",
        hubId: "ajay",
    },
    {
        id: "5",
        name: "Emily Davis",
        title: "Chief Marketing Officer",
        company: "GrowthGen",
        location: "Austin, TX",
        matchReason: "Emily has scaled multiple D2C brands to $10M+ ARR.",
        hubId: "shubham",
    },
    {
        id: "6",
        name: "James Wilson",
        title: "Head of Sales",
        company: "CloseIt",
        location: "Chicago, IL",
        matchReason: "James is a sales leader with a strong network in enterprise software.",
        hubId: "shubham",
    },
    {
        id: "7",
        name: "Linda Martinez",
        title: "CTO",
        company: "FinTech Solutions",
        location: "Miami, FL",
        matchReason: "Linda is a veteran CTO with experience in blockchain and payments.",
        hubId: "ajay",
    },
    {
        id: "8",
        name: "Robert Taylor",
        title: "Principal Investor",
        company: "VentureCap",
        location: "Boston, MA",
        matchReason: "Robert focuses on early-stage B2B investments.",
        hubId: "shubham",
    },
    {
        id: "9",
        name: "Karen White",
        title: "VP of HR",
        company: "PeopleFirst",
        location: "Seattle, WA",
        matchReason: "Karen is an expert in organizational design and culture scaling.",
        hubId: "ajay",
    },
    {
        id: "10",
        name: "Thomas Anderson",
        title: "Lead Data Scientist",
        company: "AI Labs",
        location: "Toronto, ON",
        matchReason: "Thomas specializes in NLP and large language models.",
        hubId: "shubham",
    },
    {
        id: "11",
        name: "Olivia Brown",
        title: "Product Marketing Manager",
        company: "SaaSify",
        location: "Denver, CO",
        matchReason: "Olivia excels at go-to-market strategies for developer tools.",
        hubId: "ajay",
    },
    {
        id: "12",
        name: "William Clark",
        title: "General Counsel",
        company: "LegalTech",
        location: "Washington, DC",
        matchReason: "William has extensive experience in IP law and tech regulation.",
        hubId: "shubham",
    }
]
