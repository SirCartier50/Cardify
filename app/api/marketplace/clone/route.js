import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, doc, getDoc, setDoc, writeBatch, increment, updateDoc } from "firebase/firestore";

export async function POST(req) {
    try {
        const {userId, deckId} = await req.json()

        if (!userId || !deckId) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400})
        }

        const publicDeckRef = doc(db, 'public_decks', deckId)
        const publicDeckSnap = await getDoc(publicDeckRef)

        if (!publicDeckSnap.exists()) {
            return NextResponse.json({error: "Deck not found"}, {status: 404})
        }

        const publicDeck = publicDeckSnap.data()
        const deckName = publicDeck.name

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), userId)
        const userSnap = await getDoc(userDocRef)

        let collections = []
        if (userSnap.exists()) {
            collections = userSnap.data().flashcards || []
        }

        let finalName = deckName
        let counter = 1
        while (collections.find(f => f.name === finalName)) {
            finalName = `${deckName} (${counter})`
            counter++
        }

        collections.push({name: finalName})
        batch.set(userDocRef, {flashcards: collections}, {merge: true})

        const colRef = collection(userDocRef, finalName)
        publicDeck.cards.forEach((card) => {
            const cardDoc = doc(colRef)
            batch.set(cardDoc, {front: card.front, back: card.back})
        })

        await batch.commit()

        await updateDoc(publicDeckRef, {
            cloneCount: increment(1)
        })

        return NextResponse.json({message: "Deck cloned successfully", name: finalName})
    } catch (error) {
        return NextResponse.json({error: "Failed to clone deck"}, {status: 500})
    }
}
