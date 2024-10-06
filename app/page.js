'use client'
import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import {SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { AppBar, Box, Button, Container, Fade, Grid, Toolbar, Typography, Slide, Zoom } from "@mui/material";
import Head from "next/head";
import { useState, useEffect } from "react";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useRouter } from "next/navigation";


export default function Home() {
  const {isLoaded, isSignedIn, user} = useUser()
  const [hasSubscription, setHasSubscription] = useState(false);
  const router = useRouter()

  useEffect(() => {
    const checkSubscription = async () => {
      if (user?.id) { // Ensure user ID is available
        const docRef = doc(collection(db, 'users'), user.id)
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const subscription = docSnap.data().subscription || '';
            console.log("here", subscription);
            setHasSubscription(!!subscription);
          } else {
            setHasSubscription(false);
          }
        } catch (error) {
          console.error('Error fetching document:', error);
          setHasSubscription(false);
        }
      }
    };

    checkSubscription();
  }, [user]);

  useEffect(() => {
    if (isSignedIn && hasSubscription) {
      router.push('/flashcards');
    }
  }, [isSignedIn, hasSubscription, router]);

  const handleSubmit = async () =>{
    const checkoutSession = await fetch('/api/checkout_session', {
      method:'POST',
      headers: {
        origin: 'http://localhost:3000',
      },
    })

    const checkoutSessionJson = await checkoutSession.json()

    if (checkoutSession.statusCode === 500){
      console.error(checkoutSession.message)
      return
    }

    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id
    })

    if (error){
      console.warn(error.message)
    }
  }
  const setSubscription = async () =>{
    const docRef = doc(collection(db, 'users'), user.id)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      setDoc(docRef, {subscription: "Basic"}, {merge:true})
    }else{
      setDoc(docRef, {subscription: "Basic"})
    }
    setHasSubscription(true)
  }
  if(!isSignedIn){
    return (
      <Container maxWidth>
        <Head>
          <title>Cardify</title>
          <meta name="description" content="Create flashcard from your text"/>
        </Head>

        <AppBar position="static">
          <Toolbar>
            <Typography varaint = "h6" style={{flexGrow: 1}}>Cardify</Typography>
            <SignedOut>
              <Button color="inherit" href="/sign-in">login</Button>
              <Button color="inherit" href="/sign-up">Sign Up</Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
        </AppBar>
        <Box sx={{textAlign:'center', my:4,}}>
          <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'50ms'}}>
              <Typography variant ="h2" gutterBottom>Welcome to Cardify</Typography>
          </Fade>
          <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'900ms'}}>
            <Typography variant ="h5" gutterBottom>
              {' '}
              The easiest way to make flashcards from your text
            </Typography>
          </Fade>
        </Box>
        <Box sx ={{my: 6}}>
          <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
              Features
            </Typography>
          </Fade>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
                <Typography variant="h6" gutterBottom>Easy Text Input</Typography>
              </Fade>
              <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
                <Typography>
                  {' '}
                  Simply input your text and let our software do the rest. Creating flashcards has never been easier.
                </Typography>
              </Fade>
            </Grid>
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
                <Typography variant="h6" gutterBottom>Smart Flashcards</Typography>
              </Fade>
              <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
                <Typography>
                  {' '}
                  Our AI intelligently generates concise text for flashcards that are perfect for studying.
                </Typography>
              </Fade>
            </Grid>
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
                <Typography variant="h6" gutterBottom>Accessible Anywhere</Typography>
              </Fade>
              <Fade in={true} timeout={{ enter: 1000 }} style={{ transitionDelay:'2000ms'}}>
                <Typography>
                  {' '}
                  Acess your flashcards anywhere with ease. Works with any device to ensure availability.
                </Typography>
              </Fade>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{my:6, textAlign:'center'}}>
          <Fade in={true} timeout={{ enter: 800 }} style={{ transitionDelay:'2900ms'}}>
            <Typography variant="h4" gutterBottom>Prices</Typography>
          </Fade>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Zoom in={true} timeout={{ enter: 500 }} style={{ transitionDelay:'2900ms'}}>
                <Box sx={{p:3, border:'1px solid', borderColor:'grey.300', borderRadius: 2, boxShadow: 6}}>
                  
                  <Typography variant="h5" gutterBottom>Basic</Typography>
                  <Typography variant="h6" gutterBottom>Free</Typography>
                  <Typography>
                    {' '}
                    Access to basic flashcard features and limited storage
                  </Typography>
                </Box>
              </Zoom>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={true} timeout={{ enter: 500 }} style={{ transitionDelay:'2900ms'}}>
              <Box sx={{p:3, border:'1px solid', borderColor:'grey.300', borderRadius: 2, boxShadow: 6}}>
                <Typography variant="h5" gutterBottom>Premium</Typography>
                <Typography variant="h6" gutterBottom>$3.99 / month</Typography>
                <Typography>
                  {' '}
                  Access to Premium flashcard features and unlimited storage
                </Typography>
              </Box>
              </Zoom>
            </Grid>
          </Grid>
          
        </Box>
        <Zoom in={true} timeout={{ enter: 500 }} style={{ transitionDelay:'3400ms'}}>
          <Box sx={{textAlign:'center', my:4,}}>
            <Button variant="contained" color="primary" sx={{ mt: 2, mx: 'auto' }} href="/sign-up">
              Get Started
            </Button>
          </Box>
        </Zoom>
      </Container>
    )
  }else  if (isSignedIn && !hasSubscription){
    return(
      <Container maxWidth>
        <AppBar position="static">
          <Toolbar>
            <Typography varaint = "h6" style={{flexGrow: 1}}>Cardify</Typography>
            <SignedOut>
              <Button color="inherit" href="/sign-in">login</Button>
              <Button color="inherit" href="/sign-up">Sign Up</Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
        </AppBar>
        <Box sx={{my:6, textAlign:'center'}}>
          <Typography variant="h4" gutterBottom>Prices</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{p:3, border:'1px solid', borderColor:'grey.300', borderRadius: 2,}}>
                <Typography variant="h5" gutterBottom>Basic</Typography>
                <Typography variant="h6" gutterBottom>Free</Typography>
                <Typography>
                  {' '}
                  Access to basic flashcard features and limited storage
                </Typography>
                <Button variant="contained" color="primary" sx={{mt:2}} onClick={setSubscription} >Choose Basic</Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{p:3, border:'1px solid', borderColor:'grey.300', borderRadius: 2, }}>
                <Typography variant="h5" gutterBottom>Premium</Typography>
                <Typography variant="h6" gutterBottom>$3.99 / month</Typography>
                <Typography>
                  {' '}
                  Access to Premium flashcard features and unlimited storage
                </Typography>
                <Button variant="contained" color="primary" sx={{mt:2}} onClick = {handleSubmit}>Choose Premium</Button>
              </Box>
            </Grid>
          </Grid>
          
        </Box>
      </Container>
    )
  }else{
    return(<Typography variant="h5">Loading...</Typography>)
  }
}
