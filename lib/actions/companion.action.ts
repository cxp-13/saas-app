'use server'
import { auth } from "@clerk/nextjs/server"
import { createSupabaseClient } from "../supabase";
import { delay } from "../utils";

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.from("companions").insert([
        {
            ...formData,
            author
        }
    ]).select();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create companion');
    }

    return data[0];

}


export const getAllCompanions = async ({ limit = 10, page = 1, subject = '', topic = '' }: GetAllCompanions) => {
    const supabase = createSupabaseClient();
    const MAX_RETRIES = 5; // 最大重试次数
    let retries = 0; // 当前重试次数
    let lastError: Error | null = null; // 存储最后一次的错误

    while (retries < MAX_RETRIES) {
        try {
            let query = supabase.from("companions").select();

            // 构建查询条件
            if (subject && topic) {
                query = query.ilike('subject', `%${subject}%`).or(`topic.ilike.%${topic},name.ilike.%${topic}%`);
            } else if (subject) {
                query = query.ilike('subject', `%${subject}%`);
            } else if (topic) {
                query = query.or(`topic.ilike.%${topic},name.ilike.%${topic}%`);
            }

            // 应用分页
            query = query.range((page - 1) * limit, page * limit - 1);
            // 默认排序，通常查询数据都会有排序，避免每次结果顺序不一致
            query = query.order('created_at', { ascending: false }); // 假设有 created_at 字段

            const { data: companions, error } = await query;

            if (error) {
                // 如果是 Supabase 错误，记录并尝试重试
                console.warn(`Attempt ${retries + 1}/${MAX_RETRIES} failed for getAllCompanions:`, error.message);
                lastError = new Error(error.message); // 更新最后一次错误
                retries++;
                // 增加延迟，例如指数退避
                await delay(1000 * Math.pow(2, retries - 1)); // 1s, 2s, 4s, 8s, ...
                continue; // 继续下一次循环 (重试)
            }

            // 成功获取数据，直接返回
            return companions;

        } catch (e) {
            // 捕获非 Supabase 客户端错误（例如网络中断、TypeError等）
            console.error(`Attempt ${retries + 1}/${MAX_RETRIES} caught an unexpected error for getAllCompanions:`, e);
            lastError = e instanceof Error ? e : new Error(String(e));
            retries++;
            await delay(1000 * Math.pow(2, retries - 1));
            continue; // 继续下一次循环 (重试)
        }
    }

    // 所有重试都失败后，抛出最后一次捕获的错误
    console.error(`All ${MAX_RETRIES} attempts to fetch companions failed.`);
    throw lastError || new Error("Failed to fetch companions after multiple retries.");
};


export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data: companion, error } = await supabase.from("companions").select().eq("id", id).single();

    console.log("getCompanion", companion)

    if (error) {
        throw new Error(error.message);
    }

    return companion;
}


export const createSession = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.from("session_history").insert([
        {
            companion_id: companionId,
            user_id: userId,
        }
    ]).select();

    if (error || !data) {
        throw new Error(error?.message || 'Failed to create session');
    }

}


export const getRecentSessions = async (limit: number = 10) => {
    const supabase = createSupabaseClient();

    const { data: sessions, error } = await supabase.from("session_history").select('companions:companion_id (*)').order("created_at", { ascending: false }).range(0, limit - 1);

    if (error) {
        throw new Error(error.message);
    }

    return sessions;
}

export const getUserSessions = async (userId: string, limit: number = 10) => {
    const supabase = createSupabaseClient();

    const { data: sessions, error } = await supabase.from("session_history").select('companions:companion_id (*)').eq('user_id', userId).order("created_at", { ascending: false }).range(0, limit - 1);

    if (error) {
        throw new Error(error.message);
    }

    return sessions.map((session) => session.companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();

    const { data: companions, error } = await supabase.from("companions").select().eq('author', userId);

    if (error) {
        throw new Error(error.message);
    }

    return companions;
}



export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();

    const supabase = createSupabaseClient();

    let limit = 0;

    if (has({ plan: 'pro' })) {
        return true;
    } else if (has({ feature: "3_companion_limit" })) {
        limit = 3;
    } else if (has({ feature: "10_companion_limit" })) {
        limit = 10;
    }


    const { data, error } = await supabase.from("companions").select('id', { count: 'exact' }).eq("author", userId);

    if (error) {
        throw new Error(error.message);

    }

    const companionCount = data?.length;

    if (companionCount >= limit) {
        return false;
    } else {
        return true;
    }





}
