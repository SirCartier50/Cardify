import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, query, orderBy, limit, startAfter, doc, getDoc, where } from "firebase/firestore";

export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const limitCount = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''

    try {
        const publicDecksRef = collection(db, 'public_decks')
        let q = query(publicDecksRef, orderBy('createdAt', 'desc'), limit(limitCount))

        const snapshot = await getDocs(q)
        let decks = []
        snapshot.forEach((doc) => {
            decks.push({id: doc.id, ...doc.data()})
        })

        if (search) {
            const searchLower = search.toLowerCase()
            decks = decks.filter(deck =>
                deck.name.toLowerCase().includes(searchLower) ||
                (deck.description && deck.description.toLowerCase().includes(searchLower)) ||
                (deck.tags && deck.tags.some(tag => tag.toLowerCase().includes(searchLower)))
            )
        }

        return NextResponse.json(decks)
    } catch (error) {
        return NextResponse.json({error: "Failed to fetch decks"}, {status: 500})
    }
}

export async function POST(req) {
    try {
        const body = await req.json()
        const {userId, userName, deckName, description, tags, cards} = body

        if (!userId || !deckName || !cards || cards.length === 0) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400})
        }

        const publicDecksRef = collection(db, 'public_decks')
        const deckDoc = await addDoc(publicDecksRef, {
            name: deckName,
            description: description || '',
            tags: tags || [],
            authorId: userId,
            authorName: userName || 'Anonymous',
            cardCount: cards.length,
            cards: cards,
            cloneCount: 0,
            createdAt: new Date().toISOString(),
        })

        return NextResponse.json({id: deckDoc.id, message: "Deck published successfully"})
    } catch (error) {
        return NextResponse.json({error: "Failed to publish deck"}, {status: 500})
    }
}
