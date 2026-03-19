import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, doc, getDoc, setDoc, addDoc } from "firebase/firestore";

export async function POST(req) {
    try {
        const {userId, deckName, cardsStudied, cardsCorrect, totalCards} = await req.json()

        if (!userId || !deckName) {
            return NextResponse.json({error: "Missing required fields"}, {status: 400})
        }

        const sessionRef = collection(db, 'users', userId, 'study_sessions')
        await addDoc(sessionRef, {
            deckName,
            cardsStudied: cardsStudied || 0,
            cardsCorrect: cardsCorrect || 0,
            totalCards: totalCards || 0,
            masteryRate: totalCards > 0 ? Math.round((cardsCorrect / totalCards) * 100) : 0,
            timestamp: new Date().toISOString(),
        })

        const statsRef = doc(db, 'users', userId)
        const statsSnap = await getDoc(statsRef)
        const data = statsSnap.exists() ? statsSnap.data() : {}

        const today = new Date().toISOString().split('T')[0]
        const lastStudyDate = data.lastStudyDate || ''
        const currentStreak = data.studyStreak || 0

        let newStreak = 1
        if (lastStudyDate) {
            const last = new Date(lastStudyDate)
            const now = new Date(today)
            const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))

            if (diffDays === 0) {
                newStreak = currentStreak
            } else if (diffDays === 1) {
                newStreak = currentStreak + 1
            }
        }

        const longestStreak = Math.max(data.longestStreak || 0, newStreak)
        const totalSessions = (data.totalSessions || 0) + 1
        const totalCardsStudied = (data.totalCardsStudied || 0) + (cardsStudied || 0)

        await setDoc(statsRef, {
            lastStudyDate: today,
            studyStreak: newStreak,
            longestStreak,
            totalSessions,
            totalCardsStudied,
        }, {merge: true})

        return NextResponse.json({
            streak: newStreak,
            longestStreak,
            totalSessions,
            totalCardsStudied,
        })
    } catch (error) {
        return NextResponse.json({error: "Failed to record study session"}, {status: 500})
    }
}
