'use client'
import { formUrlQuery, removeKeysFromUrlQuery } from '@jsmastery/utils';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'

const SearchInput = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');

    // 使用 useRef 存储 setTimeout 的 ID，方便清理
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // 清理之前的 setTimeout（防抖关键）
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // 设置新的 setTimeout（1 秒后执行搜索）
        timeoutRef.current = window.setTimeout(() => {
            if (searchQuery.trim()) { // 如果输入不为空
                const newUrl = formUrlQuery({
                    params: searchParams.toString(),
                    key: 'topic',
                    value: searchQuery,
                });
                console.log('newUrl (with topic):', newUrl);
                router.push(newUrl);
            } else if (pathname === "/companions") { // 如果输入为空，且当前路径是 /companions
                // 直接跳转回 pathname（移除 topic 参数）
                const newUrl = removeKeysFromUrlQuery({
                    params: searchParams.toString(),
                    keysToRemove: ['topic'],
                })
                router.push(newUrl); // 更简洁的方式
            }
        }, 1000); // 1 秒延迟

        // 组件卸载时清理 setTimeout
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [searchQuery]); // 只监听 searchQuery 变化

    return (
        <div className='relative border border-black rounded-lg items-center flex gap-2 px-2 py-1 h-fit'>
            <Image src="/icons/search.svg" alt="search" width={15} height={15} />
            <input
                placeholder='Search companions'
                className='outline-none'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    )
}

export default SearchInput