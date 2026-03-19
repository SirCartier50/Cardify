'use client'

import { SignedIn, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    AppBar, Box, Button, Card, CardContent, CardActions, Chip,
    Container, Grid, TextField, Toolbar, Typography, Snackbar, Alert,
    InputAdornment, CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import StyleIcon from '@mui/icons-material/Style'

export default function Marketplace() {
    const {isLoaded, isSignedIn, user} = useUser()
    const router = useRouter()
    const [decks, setDecks] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [cloning, setCloning] = useState(null)
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'})

    useEffect(() => {
        fetchDecks()
    }, [])

    const fetchDecks = async (searchTerm = '') => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchTerm) params.set('search', searchTerm)
            const res = await fetch(`/api/marketplace?${params.toString()}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setDecks(data)
            }
        } catch (error) {
            setSnackbar({open: true, message: 'Failed to load decks', severity: 'error'})
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        fetchDecks(search)
    }

    const handleClone = async (deckId, deckName) => {
        if (!isSignedIn) {
            router.push('/sign-in')
            return
        }
        setCloning(deckId)
        try {
            const res = await fetch('/api/marketplace/clone', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: user.id, deckId}),
            })
            const data = await res.json()
            if (res.ok) {
                setSnackbar({open: true, message: `"${deckName}" cloned to your collection!`, severity: 'success'})
                fetchDecks(search)
            } else {
                setSnackbar({open: true, message: data.error || 'Failed to clone deck', severity: 'error'})
            }
        } catch (error) {
            setSnackbar({open: true, message: 'Failed to clone deck', severity: 'error'})
        } finally {
            setCloning(null)
        }
    }

    return (
        <Container maxWidth="lg">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" style={{flexGrow: 1}}>Cardify</Typography>
                    <Button color="inherit" href="/marketplace">Marketplace</Button>
                    <Button color="inherit" href="/flashcards">My Decks</Button>
                    <Button color="inherit" href="/generate" sx={{mr: 2}}>Generate</Button>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </Toolbar>
            </AppBar>

            <Box sx={{mt: 4, mb: 3}}>
                <Typography variant="h3" gutterBottom>Deck Marketplace</Typography>
                <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
                    Discover and clone community-created flashcard sets
                </Typography>

                <Box component="form" onSubmit={handleSearch} sx={{display: 'flex', gap: 2, mb: 4}}>
                    <TextField
                        fullWidth
                        placeholder="Search decks by name, description, or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button variant="contained" type="submit">Search</Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 8}}>
                    <CircularProgress />
                </Box>
            ) : decks.length === 0 ? (
                <Box sx={{textAlign: 'center', mt: 8}}>
                    <StyleIcon sx={{fontSize: 64, color: 'text.secondary', mb: 2}} />
                    <Typography variant="h5" color="text.secondary">No decks found</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{mt: 1}}>
                        Be the first to share a deck! Generate flashcards and publish them to the marketplace.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {decks.map((deck) => (
                        <Grid item xs={12} sm={6} md={4} key={deck.id}>
                            <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                <CardContent sx={{flexGrow: 1}}>
                                    <Typography variant="h6" gutterBottom>{deck.name}</Typography>
                                    {deck.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                            {deck.description}
                                        </Typography>
                                    )}
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2}}>
                                        {deck.tags && deck.tags.map((tag, i) => (
                                            <Chip key={i} label={tag} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {deck.cardCount} cards · by {deck.authorName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {deck.cloneCount || 0} clones
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{px: 2, pb: 2}}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => handleClone(deck.id, deck.name)}
                                        disabled={cloning === deck.id}
                                    >
                                        {cloning === deck.id ? 'Cloning...' : 'Clone to My Decks'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

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
