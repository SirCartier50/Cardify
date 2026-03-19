'use client'

import { UserButton, useUser, SignedIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import {collection, doc, getDoc, getDocs} from 'firebase/firestore'
import { db } from '@/firebase'
import { useSearchParams } from 'next/navigation'
import {
    Toolbar, Container, TextField, Typography, Box, Card, CardActionArea,
    CardContent, Dialog, DialogTitle, DialogContent, DialogContentText,
    DialogActions, Button, Grid, AppBar, Snackbar, Alert
} from "@mui/material"
import ShareIcon from '@mui/icons-material/Share'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

export default function Flashcard(){
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [publishOpen, setPublishOpen] = useState(false)
    const [description, setDescription] = useState('')
    const [tags, setTags] = useState('')
    const [publishing, setPublishing] = useState(false)
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'})

    // Study mode state
    const [studyMode, setStudyMode] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [studyFlipped, setStudyFlipped] = useState(false)
    const [correctCount, setCorrectCount] = useState(0)
    const [studiedCount, setStudiedCount] = useState(0)
    const [studyComplete, setStudyComplete] = useState(false)

    const searchParams = useSearchParams()
    const search = searchParams.get('id')

    useEffect(() =>{
        async function getFlashcard() {
            if (!search || !user) return
            const colRef = collection(doc(collection(db, 'users'), user.id), search)
            const docs = await getDocs(colRef)
            const flashcards = []
            docs.forEach((doc)=>{
                flashcards.push({id: doc.id, ...doc.data()})
            })
            setFlashcards(flashcards)
        }
        getFlashcard()
    }, [user, search])

    const handleCardClick=(id) => {
        setFlipped((prev) => ({
            ...prev, [id] : !prev[id]
        }))
    }

    const handlePublish = async () => {
        setPublishing(true)
        try {
            const res = await fetch('/api/marketplace', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    userId: user.id,
                    userName: user.fullName || user.firstName || 'Anonymous',
                    deckName: search,
                    description,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    cards: flashcards.map(({front, back}) => ({front, back})),
                }),
            })
            const data = await res.json()
            if (res.ok) {
                setSnackbar({open: true, message: 'Deck published to marketplace!', severity: 'success'})
                setPublishOpen(false)
                setDescription('')
                setTags('')
            } else {
                setSnackbar({open: true, message: data.error || 'Failed to publish', severity: 'error'})
            }
        } catch (error) {
            setSnackbar({open: true, message: 'Failed to publish deck', severity: 'error'})
        } finally {
            setPublishing(false)
        }
    }

    const startStudy = () => {
        setStudyMode(true)
        setCurrentIndex(0)
        setStudyFlipped(false)
        setCorrectCount(0)
        setStudiedCount(0)
        setStudyComplete(false)
    }

    const handleStudyAnswer = async (correct) => {
        const newStudied = studiedCount + 1
        const newCorrect = correct ? correctCount + 1 : correctCount
        setStudiedCount(newStudied)
        setCorrectCount(newCorrect)
        setStudyFlipped(false)

        if (currentIndex + 1 >= flashcards.length) {
            setStudyComplete(true)
            try {
                await fetch('/api/study', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        userId: user.id,
                        deckName: search,
                        cardsStudied: newStudied,
                        cardsCorrect: newCorrect,
                        totalCards: flashcards.length,
                    }),
                })
            } catch (e) {
                // silently fail — session still recorded locally
            }
        } else {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const exitStudy = () => {
        setStudyMode(false)
        setStudyComplete(false)
    }

    if (!isLoaded || !isSignedIn){
        return <></>
    }

    // Study mode UI
    if (studyMode) {
        if (studyComplete) {
            const masteryRate = flashcards.length > 0 ? Math.round((correctCount / flashcards.length) * 100) : 0
            return (
                <Container maxWidth="sm" sx={{textAlign: 'center', mt: 8}}>
                    <Typography variant="h3" gutterBottom>Session Complete!</Typography>
                    <Typography variant="h1" sx={{my: 4, fontWeight: 'bold', color: masteryRate >= 70 ? '#4caf50' : '#ff9800'}}>
                        {masteryRate}%
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                        {correctCount} / {flashcards.length} correct
                    </Typography>
                    <Box sx={{mt: 4, display: 'flex', gap: 2, justifyContent: 'center'}}>
                        <Button variant="contained" onClick={startStudy}>Study Again</Button>
                        <Button variant="outlined" onClick={exitStudy}>Back to Deck</Button>
                        <Button variant="outlined" href="/analytics">View Analytics</Button>
                    </Box>
                </Container>
            )
        }

        const card = flashcards[currentIndex]
        return (
            <Container maxWidth="sm" sx={{mt: 4}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                    <Button variant="outlined" onClick={exitStudy}>Exit Study</Button>
                    <Typography variant="body1" color="text.secondary">
                        {currentIndex + 1} / {flashcards.length}
                    </Typography>
                </Box>

                <Card
                    sx={{cursor: 'pointer', mb: 3}}
                    onClick={() => setStudyFlipped(!studyFlipped)}
                >
                    <CardContent>
                        <Box sx={{
                            perspective: '1000px',
                            '& > div': {
                                transition: 'transform 0.6s',
                                transformStyle: 'preserve-3d',
                                position: 'relative',
                                width: '100%',
                                height: '300px',
                                transform: studyFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                            },
                            '& > div > div': {
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                backfaceVisibility: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 3,
                                boxSizing: 'border-box',
                            },
                            '& > div > div:nth-of-type(2)': {
                                transform: 'rotateY(180deg)'
                            }
                        }}>
                            <div>
                                <div>
                                    <Typography variant="h4" component="div" sx={{textAlign: 'center'}}>
                                        {card.front}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="h4" component="div" sx={{textAlign: 'center'}}>
                                        {card.back}
                                    </Typography>
                                </div>
                            </div>
                        </Box>
                    </CardContent>
                </Card>

                {!studyFlipped ? (
                    <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center'}}>
                        Tap the card to reveal the answer
                    </Typography>
                ) : (
                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'center'}}>
                        <Button
                            variant="contained"
                            color="error"
                            size="large"
                            startIcon={<CloseIcon />}
                            onClick={() => handleStudyAnswer(false)}
                            sx={{minWidth: 140}}
                        >
                            Missed
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={<CheckIcon />}
                            onClick={() => handleStudyAnswer(true)}
                            sx={{minWidth: 140}}
                        >
                            Got It
                        </Button>
                    </Box>
                )}
            </Container>
        )
    }

    // Normal deck view
    return (
        <Container maxWidth="100vw">
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

            <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mt: 3, flexWrap: 'wrap'}}>
                <Button variant="contained" href='/flashcards'>Back</Button>
                <Typography variant="h4" sx={{flexGrow: 1}}>{search}</Typography>
                {flashcards.length > 0 && (
                    <>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrowIcon />}
                            onClick={startStudy}
                        >
                            Study Mode
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ShareIcon />}
                            onClick={() => setPublishOpen(true)}
                        >
                            Share to Marketplace
                        </Button>
                    </>
                )}
            </Box>

            <Grid container spacing={3} sx={{mt: 3}}>
                {flashcards.map((flashcard, index) =>(
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardActionArea onClick={()=>{handleCardClick(index)}}>
                                <CardContent>
                                    <Box sx={{
                                        perspective:'1000px',
                                        '& > div': {
                                            transition: 'transform 0.6s',
                                            transformStyle: 'preserve-3d',
                                            position: 'relative',
                                            width:'100%',
                                            height: '200px',
                                            boxShadow: '0 4px 8px 0 rgba(0,0,0, 0.2)',
                                            transform:flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                                        },
                                        '& > div > div': {
                                            position: 'absolute',
                                            width:'100%',
                                            height: '100%',
                                            backfaceVisibility: 'hidden',
                                            display:'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 2,
                                            boxSizing: 'border-box',
                                        },
                                        '& > div > div:nth-of-type(2)': {
                                            transform :'rotateY(180deg)'
                                        }
                                    }}>
                                        <div>
                                            <div>
                                                <Typography variant="h5" component="div">
                                                    {flashcard.front}
                                                </Typography>
                                            </div>
                                            <div>
                                                <Typography variant="h5" component="div">
                                                    {flashcard.back}
                                                </Typography>
                                            </div>
                                        </div>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={publishOpen} onClose={() => setPublishOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Share to Marketplace</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>
                        Publish &ldquo;{search}&rdquo; so other users can discover and clone it.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Description (optional)"
                        fullWidth
                        multiline
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        variant="outlined"
                        sx={{mb: 2}}
                    />
                    <TextField
                        margin="dense"
                        label="Tags (comma-separated)"
                        placeholder="e.g. biology, AP exam, chapter 5"
                        fullWidth
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPublishOpen(false)}>Cancel</Button>
                    <Button onClick={handlePublish} variant="contained" disabled={publishing}>
                        {publishing ? 'Publishing...' : 'Publish'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({...snackbar, open: false})}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}
