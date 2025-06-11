'use client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjects } from '@/constants';
import { formUrlQuery, removeKeysFromUrlQuery } from '@jsmastery/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SubjectFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectSubject, setSelectSubject] = useState('');


  useEffect(() => {
    if (selectSubject && selectSubject !== 'all') {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'subject',
        value: selectSubject,
      })

      router.push(newUrl);

    } else {
      const newUrl = removeKeysFromUrlQuery({
        params: searchParams.toString(),
        keysToRemove: ['subject'],
      })
      router.push(newUrl);
    }
  }, [selectSubject])


  return (
    <Select onValueChange={setSelectSubject} value={selectSubject} >
      <SelectTrigger className="input capitalize">
        <SelectValue placeholder="Select the subject" />
      </SelectTrigger>
      <SelectContent>
        {
          subjects.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))

        }
        <SelectItem key={"all"} value={"all"}>
          ALL
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default SubjectFilter