'use client'

import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { collection, doc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import {
    AppBar, Box, Button, Card, CardContent, Container, Grid,
    LinearProgress, Toolbar, Typography, CircularProgress
} from '@mui/material'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import SchoolIcon from '@mui/icons-material/School'
import TimelineIcon from '@mui/icons-material/Timeline'
import StyleIcon from '@mui/icons-material/Style'

export default function Analytics() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [stats, setStats] = useState(null)
    const [sessions, setSessions] = useState([])
    const [deckMastery, setDeckMastery] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        async function fetchAnalytics() {
            try {
                const userRef = doc(db, 'users', user.id)
                const userSnap = await getDoc(userRef)

                if (userSnap.exists()) {
                    const data = userSnap.data()
                    setStats({
                        studyStreak: data.studyStreak || 0,
                        longestStreak: data.longestStreak || 0,
                        totalSessions: data.totalSessions || 0,
                        totalCardsStudied: data.totalCardsStudied || 0,
                    })
                } else {
                    setStats({studyStreak: 0, longestStreak: 0, totalSessions: 0, totalCardsStudied: 0})
                }

                const sessionsRef = collection(db, 'users', user.id, 'study_sessions')
                const sessionsQuery = query(sessionsRef, orderBy('timestamp', 'desc'), limit(20))
                const sessionsSnap = await getDocs(sessionsQuery)
                const sessionList = []
                sessionsSnap.forEach(doc => {
                    sessionList.push({id: doc.id, ...doc.data()})
                })
                setSessions(sessionList)

                const masteryMap = {}
                sessionList.forEach(session => {
                    const deck = session.deckName
                    if (!masteryMap[deck]) {
                        masteryMap[deck] = {totalCorrect: 0, totalCards: 0, sessionCount: 0}
                    }
                    masteryMap[deck].totalCorrect += session.cardsCorrect || 0
                    masteryMap[deck].totalCards += session.totalCards || 0
                    masteryMap[deck].sessionCount += 1
                })

                const mastery = Object.entries(masteryMap).map(([name, data]) => ({
                    name,
                    masteryRate: data.totalCards > 0 ? Math.round((data.totalCorrect / data.totalCards) * 100) : 0,
                    sessionCount: data.sessionCount,
                }))
                mastery.sort((a, b) => b.sessionCount - a.sessionCount)
                setDeckMastery(mastery)
            } catch (error) {
                setStats({studyStreak: 0, longestStreak: 0, totalSessions: 0, totalCardsStudied: 0})
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [user])

    if (!isLoaded || !isSignedIn) {
        return <></>
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{textAlign: 'center', mt: 8}}>
                <CircularProgress />
            </Container>
        )
    }

    const formatDate = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})
    }

    return (
        <Container maxWidth="lg">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{flexGrow: 1}}>Cardify</Typography>
                    <Button color="inherit" href="/marketplace">Marketplace</Button>
                    <Button color="inherit" href="/flashcards">My Decks</Button>
                    <Button color="inherit" href="/generate">Generate</Button>
                    <Button color="inherit" href="/analytics" sx={{mr: 2}}>Analytics</Button>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </Toolbar>
            </AppBar>

            <Box sx={{mt: 4, mb: 3}}>
                <Typography variant="h3" gutterBottom>Study Analytics</Typography>
            </Box>

            <Grid container spacing={3} sx={{mb: 4}}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{textAlign: 'center', py: 2}}>
                        <CardContent>
                            <WhatshotIcon sx={{fontSize: 40, color: '#ff6b35', mb: 1}} />
                            <Typography variant="h3" sx={{fontWeight: 'bold'}}>
                                {stats.studyStreak}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Day Streak
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{textAlign: 'center', py: 2}}>
                        <CardContent>
                            <WhatshotIcon sx={{fontSize: 40, color: '#e91e63', mb: 1}} />
                            <Typography variant="h3" sx={{fontWeight: 'bold'}}>
                                {stats.longestStreak}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Longest Streak
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{textAlign: 'center', py: 2}}>
                        <CardContent>
                            <SchoolIcon sx={{fontSize: 40, color: '#2196f3', mb: 1}} />
                            <Typography variant="h3" sx={{fontWeight: 'bold'}}>
                                {stats.totalSessions}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Study Sessions
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{textAlign: 'center', py: 2}}>
                        <CardContent>
                            <StyleIcon sx={{fontSize: 40, color: '#4caf50', mb: 1}} />
                            <Typography variant="h3" sx={{fontWeight: 'bold'}}>
                                {stats.totalCardsStudied}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Cards Studied
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <TimelineIcon sx={{mr: 1}} />
                                <Typography variant="h5">Deck Mastery</Typography>
                            </Box>
                            {deckMastery.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    Complete study sessions to see your mastery progress
                                </Typography>
                            ) : (
                                deckMastery.map((deck, i) => (
                                    <Box key={i} sx={{mb: 2}}>
                                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                                            <Typography variant="body2" sx={{fontWeight: 'bold'}}>
                                                {deck.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {deck.masteryRate}% · {deck.sessionCount} sessions
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={deck.masteryRate}
                                            sx={{height: 8, borderRadius: 4}}
                                        />
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                <SchoolIcon sx={{mr: 1}} />
                                <Typography variant="h5">Recent Sessions</Typography>
                            </Box>
                            {sessions.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No study sessions yet. Start studying to track your progress!
                                </Typography>
                            ) : (
                                sessions.slice(0, 10).map((session, i) => (
                                    <Box key={i} sx={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', py: 1.5,
                                        borderBottom: i < Math.min(sessions.length, 10) - 1 ? '1px solid' : 'none',
                                        borderColor: 'divider'
                                    }}>
                                        <Box>
                                            <Typography variant="body1" sx={{fontWeight: 'bold'}}>
                                                {session.deckName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(session.timestamp)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{textAlign: 'right'}}>
                                            <Typography variant="body2">
                                                {session.cardsCorrect}/{session.totalCards} correct
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {session.masteryRate}% mastery
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}
