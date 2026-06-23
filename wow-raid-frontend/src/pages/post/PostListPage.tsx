import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { postApi } from '@/api/post.api'
import { BoardType, UserRole } from '@/types/enums'
import { useAuthStore } from '@/stores/auth.store'
import { formatRelative } from '@/utils/date.util'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Plus, Pin, Eye } from 'lucide-react'

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const boardType = (searchParams.get('boardType') as BoardType) ?? BoardType.NOTICE
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['posts', boardType],
    queryFn: () => postApi.getList(boardType),
  })

  const canWrite =
    boardType === BoardType.FREE
      ? !!user
      : user?.role === UserRole.ADMIN

  return (
    <div>
      {/* 탭 + 작성 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
          {[BoardType.NOTICE, BoardType.FREE].map((type) => (
            <button
              key={type}
              onClick={() => setSearchParams({ boardType: type })}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                boardType === type
                  ? 'bg-yellow-500 text-gray-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {type === BoardType.NOTICE ? '공지사항' : '자유게시판'}
            </button>
          ))}
        </div>
        {canWrite && (
          <Link
            to="/posts/new"
            state={{ boardType }}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            글쓰기
          </Link>
        )}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.content.length ? (
        <div className="text-center py-20 text-gray-500">게시글이 없습니다.</div>
      ) : (
        <div className="divide-y divide-gray-800">
          {data.content.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="flex items-center gap-4 py-4 hover:bg-gray-800 px-3 rounded-lg transition-colors group"
            >
              {post.pinned && <Pin className="w-4 h-4 text-yellow-400 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-white group-hover:text-yellow-400 transition-colors truncate font-medium">
                  {post.title}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {post.author} · {formatRelative(post.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs shrink-0">
                <Eye className="w-3.5 h-3.5" />
                {post.viewCount}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
