import CompanionsList from "@/components/CompanionsList"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getUserCompanions, getUserSessions } from "@/lib/actions/companion.action"
import { currentUser } from "@clerk/nextjs/server"
import Image from "next/image"
import { redirect } from "next/navigation"
const Profile = async () => {

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in")
  }

  const userCompanions = await getUserCompanions(user.id);
  const userSessions = await getUserSessions(user.id);


  return (
    <main className='min-lg:w-3/4'>

      <section className="flex justify-between gap-4 max-sm:flex-col items-center">
        <div className="flex gap-4 items-center">
          <Image src={user.imageUrl} alt={user.firstName!} width={110} height={110} />
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.emailAddresses[0].emailAddress}
            </p>

          </div>
        </div>
        <div className="flex gap-4">
          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image src="/icons/check.svg" alt="checkmark" width={22} height={22} />
              <p className="text-lg font-bold">{userSessions.length}</p>

            </div>
            <p>Lessions complete</p>
          </div>

          <div className="border border-black rounded-lg p-3 gap-2 flex flex-col h-fit">
            <div className="flex gap-2 items-center">
              <Image src="/icons/cap.svg" alt="cap" width={22} height={22} />
              <p className="text-lg font-bold">{userCompanions.length}</p>

            </div>
            <p>Companion complete</p>
          </div>

        </div>


      </section>

      <Accordion type="multiple">
        <AccordionItem value="recent">
          <AccordionTrigger className="text-2xl font-bold">Recent Sessions</AccordionTrigger>
          <AccordionContent>
            <CompanionsList companions={userSessions} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="companions">
          <AccordionTrigger className="text-2xl font-bold">Recent Companions</AccordionTrigger>
          <AccordionContent>
            <CompanionsList companions={userCompanions} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>


    </main>

  )
}

export default Profile