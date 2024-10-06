'use client'

import {useEffect, useState} from 'react'
import { useRouter } from 'next/navigation'
import getStripe from '@/utils/get-stripe'
import { useSearchParams } from 'next/navigation'
import { CircularProgress, Container, Typography, Box } from '@mui/material'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import {SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

const ResultPage = () =>{
    const router = useRouter()
    const {isLoaded, isSignedIn, user} = useUser()
    const searchParams = useSearchParams()
    const session_id = searchParams.get('session_id')
    const redirectUrl = searchParams.get('redirect')

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [error, setError] = useState(null)
    const [time, setTime] = useState(5)

    useEffect(() => {
        const fetchCheckoutSession = async () => {
            if (!session_id) return

            try{
                const res = await fetch(`api/checkout_session?session_id=${session_id}`)
                const sessionData = await res.json()
                if (res.ok){
                    setSession(sessionData)
                }else{
                    setError(sessionData.error)
                }
            }
            catch(err){
                setError("An error occured")
            }
            finally{
                setLoading(false)
            }
        }

        fetchCheckoutSession()
    }, [session_id])

    useEffect(() => {
        if (!redirectUrl && time > 0) {
            const timer = setTimeout(() => {
                setTime(time - 1)
            }, 1000)

            return () => clearTimeout(timer)
        } else if (!redirectUrl && time === 0) {
            router.push('./')
        }
    }, [time, router])

    const setSubscription = async () =>{
        const docRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(docRef)
    
        if(docSnap.exists()){
          setDoc(docRef, {subscription: "Premium"}, {merge:true})
        }else{
          setDoc(docRef, {subscription: "Premium"})
        }
    }

    if(session?.payment_status === "paid"){
        setSubscription()
    }

    if (loading){
        return(
            <Container maxWidth="100vw" sx={{textAlign:'center', mt:4,}}>
                <CircularProgress />
                <Typography variant="h6">{error}</Typography>
            </Container>
        )
    }

    return(
        <Container maxWidth="100vw" sx={{textAlign:'center', mt:4,}}>
            {session.payment_status === "paid" ? (
                <>
                    <Typography variant="h4">Thank you for purchasing</Typography>
                    <Box sx = {{mt:22}}>
                        <Typography variant ="h6"> Session ID: ${session_id}</Typography>
                        <Typography variant="body1">
                            We have recieved your payment. You will recieve an email with the order details shortly.
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Redirecting in {time} seconds...
                        </Typography>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="h4">Payment Failed</Typography>
                    <Box sx = {{mt:22}}>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Your payment was not successful. Please try again.
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Redirecting in {time} seconds...
                        </Typography>
                    </Box>
                </>
            )}
        </Container>
    )
}

export default ResultPage