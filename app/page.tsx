import CompanionCard from '@/components/CompanionCard'
import CompanionsList from '@/components/CompanionsList'
import CTA from '@/components/CTA'
import { Button } from '@/components/ui/button'
import { recentSessions } from '@/constants'
import { getAllCompanions, getUserSessions } from '@/lib/actions/companion.action'
import { getSubjectColor } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'

const Page = async () => {
  const companions = await getAllCompanions({ limit: 3 });
  const { userId } = await auth();
  let userCompanions: any[] = [];


  if (userId) {
    const sessions = await getUserSessions(userId)
    console.log("sessions", sessions)
    userCompanions = sessions;
  }



  return (
    <main>
      <h1 className="text-2xl underline">Popular Companions</h1>
      <section className='home-section'>
        {
          companions.map((companion) => (
            <CompanionCard
              key={companion.id}
              {...companion}
              color={getSubjectColor(companion.subject)}
            />
          ))
        }


      </section>
      <section className='home-section'>
        <CompanionsList companions={userCompanions}/>
        <CTA />

      </section>

    </main>
  )
}

export default Page