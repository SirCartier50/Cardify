'use client'
import {SignedIn, UserButton, useUser, SignedOut} from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { CollectionReference, doc, getDoc, setDoc, collection } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter } from 'next/navigation'
import { AppBar, Card, CardActionArea, CardContent, Container, Grid, Typography, Toolbar, Button} from '@mui/material'

export default function Flashcards() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()
    
    useEffect(() =>{
        async function getFlashcards() {
            if (!user) return
            const docRef = doc(collection(db, 'users'), user.id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()){
                const collections = docSnap.data().flashcards || []
                setFlashcards(collections)
            }else{
                await setDoc(docRef, {flashcards: []})
            }
        }
        getFlashcards()
    }, [user])

    if (!isLoaded || !isSignedIn){
        return <></>
    }

    const handleCardClick = (id)=> {
        router.push(`/flashcard?id=${id}`)
    }

    return(
        <Container maxWidth='100vw'>
            <AppBar position="static">
                <Toolbar>
                    <Typography varaint = "h6" style={{flexGrow: 1}}>Cardify</Typography>
                    <Button color="inherit" href="/flashcards">Flashcards</Button>
                    <Button color="inherit" href="/generate" sx={{mr:6}}>Generate</Button>
                    <SignedIn>
                    <UserButton />
                    </SignedIn>
                </Toolbar>
            </AppBar>
            <Typography variant="h3" width="250px" sx={{mt:6, borderBottom: 1} }>Flashcards</Typography>
            <Grid container spacing = {3} sx={{mt:4}}>
                {flashcards.map((flashcard, index)=>(
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardActionArea onClick={() => {
                                handleCardClick(flashcard.name)
                            }}>
                                <CardContent>
                                    <Typography variant='h6'>
                                        {flashcard.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    )
}