'use client'
import Image from "next/image";
import getStripe from "@/utils/get-stripe";
import {SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Box, Button, Container, Grid, Toolbar, Typography } from "@mui/material";
import Head from "next/head";

export default function Home() {
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
        <Typography variant ="h2" gutterBottom>Welcome to Cardify</Typography>
        <Typography variant ="h5" gutterBottom>
          {' '}
          The easist way to make flashcards from your text
        </Typography>
        <Button variant="contained" color="primary" sx={{mt:2}} href="/generate">
          Get Started
        </Button>
      </Box>
      <Box sx ={{my: 6}}>
        <Typography variant="h4" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Easy Text Input</Typography>
            <Typography>
              {' '}
              Simply input your text and let our software do the rest. Creating flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Smart Flashcards</Typography>
            <Typography>
              {' '}
              Our AI intelligently generates concise text for flashcards that are perfect for studying.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Accessible Anywhere</Typography>
            <Typography>
              {' '}
              Acess your flashcards anywhere with ease. Works with any device to ensure availability.
            </Typography>
          </Grid>
        </Grid>
      </Box>
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
              <Button variant="contained" color="primary" sx={{mt:2}} href = '/flashcards'>Choose Basic</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
          <Box sx={{p:3, border:'1px solid', borderColor:'grey.300', borderRadius: 2,}}>
              <Typography variant="h5" gutterBottom>Premium</Typography>
              <Typography variant="h6" gutterBottom>$10 / month</Typography>
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
  );
}
