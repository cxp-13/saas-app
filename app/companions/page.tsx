import CompanionCard from '@/components/CompanionCard';
import SearchInput from '@/components/SearchInput';
import SubjectFilter from '@/components/SubjectFilter';
import { getAllCompanions } from '@/lib/actions/companion.action';
import { getSubjectColor } from '@/lib/utils';
import { log } from 'console';
import React from 'react'

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  const params = await searchParams;
  const subject = params.subject ? params.subject : '';
  const topic = params.topic ? params.topic : '';

  console.log('request companions')
  const companions = await getAllCompanions({
    subject,
    topic
  });


  log("companions", companions)

  return (
    <main>
      <section className='flex justify-between gap-4 max-sm:flex-col'>
        <h1>Companion Library</h1>
        <div className='flex gap-4'>
          <SearchInput />
          <SubjectFilter />
        </div>

      </section>

      <section className='companions-grid'>
        {
          companions.map((companion) => (
            <CompanionCard key={companion.id} {...companion} color={getSubjectColor(companion.subject)} />

          ))
        }
      </section>
    </main>
  )
}

export default CompanionsLibrary