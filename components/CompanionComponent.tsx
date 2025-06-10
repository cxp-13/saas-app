'use client'
import { cn, getSubjectColor } from '@/lib/utils'
import { vapi } from '@/lib/vapi.sdk';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'
import soundwaves from '@/constants/soundwaves.json'


enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, topic, name, userName, userImage, style, voice }: CompanionComponentProps) => {

    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [isMuted, setIsMuted] = useState(false);


    useEffect(() => {
        if (isSpeaking) {
            lottieRef.current?.play();
        } else {
            lottieRef.current?.stop();
        }
    }, [isSpeaking, lottieRef])

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = () => { }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);


        const onError = (error: Error) => console.log("Error", error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);


        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        }


    }, [])

    const toggleMicrophone = () => {
        const isMuted = vapi.isMuted();
        vapi.setMuted(!isMuted);
        setIsMuted(!isMuted)
    }


    const toggleSession = () => {
        if (callStatus == CallStatus.INACTIVE || callStatus == CallStatus.FINISHED) {
            vapi.start('81512dc0-e6fa-4589-9b58-20a21887e26e');
            setCallStatus(CallStatus.CONNECTING)
            vapi.send({
                type: 'add-message',
                message: {
                    role: 'system',
                    content: 'The user has pressed the button, say hello',
                },
            });
        } else if (callStatus == CallStatus.ACTIVE) {
            vapi.stop();
            setCallStatus(CallStatus.FINISHED);

        }
    }


    return (
        <section className='flex flex-col h-[70vh]'>
            <section className='flex gap-8 max-sm:flex-col'>
                <div className='companion-section'>
                    <div className='companion-avatar' style={{
                        backgroundColor: getSubjectColor(subject)
                    }}>
                        <div className={cn('absolute transition-opacity duration-1000',
                            callStatus == CallStatus.FINISHED || callStatus == CallStatus.INACTIVE ? 'opacity-1001' : 'opacity-0', callStatus == CallStatus.CONNECTING && 'opacity-100 animate-pulse'
                        )}>
                            <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className='max-sm:w-fit' />
                        </div>
                        <div className={cn('absolute transition-opacity duration-1000', callStatus == CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0')}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className='companion-lottie'
                            />
                        </div>
                    </div>
                    <p className='font-bold text-2xl'>{name}</p>
                </div>
                <div className='user-section'>
                    <div className='user-avatar'>
                        <Image src={userImage} alt={userName} width={130} height={130} className='rounded-lg' />
                        <p className='font-bold text-2xl'>
                            {userName}
                        </p>
                    </div>
                    <button className='btn-mic' onClick={toggleMicrophone}>
                        <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt="mic" width={36} height={36} />
                        <p className='max-sm:hidden'>
                            {
                                isMuted ? 'Turn on microphone' : 'Turn off microphone'
                            }
                        </p>
                    </button>


                    <button className={cn('rounded-lg py-2 cursor-pointer transition-colors w-full bg-[#F75353] text-white')} onClick={toggleSession}>
                        {
                            callStatus == CallStatus.ACTIVE ? 'End session' : callStatus == CallStatus.CONNECTING ? 'Connecting...' : 'Start session'
                        }
                    </button>

                </div>
            </section>
        </section>
    )
}

export default CompanionComponent