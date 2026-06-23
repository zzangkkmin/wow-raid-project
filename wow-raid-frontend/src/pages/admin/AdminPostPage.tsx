import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import { postApi } from '@/api/post.api'
import { BoardType } from '@/types/enums'
import { formatDate } from '@/utils/date.util'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Trash2, ExternalLink } from 'lucide-react'

export default function AdminPostPage() {
  const queryClient = useQueryClient()

  const noticeQuery = useQuery({
    queryKey: ['admin-posts-notice'],
    queryFn: () => postApi.getList(BoardType.NOTICE, 0, 50),
  })

  const freeQuery = useQuery({
    queryKey: ['admin-posts-free'],
    queryFn: () => postApi.getList(BoardType.FREE, 0, 50),
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.forceDeletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts-notice'] })
      queryClient.invalidateQueries({ queryKey: ['admin-posts-free'] })
    },
  })

  const allPosts = [
    ...(noticeQuery.data?.content ?? []),
    ...(freeQuery.data?.content ?? []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">게시글 관리</h1>

      {noticeQuery.isLoading || freeQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="text-left px-5 py-3.5">게시판</th>
                <th className="text-left px-5 py-3.5">제목</th>
                <th className="text-left px-5 py-3.5">작성자</th>
                <th className="text-left px-5 py-3.5">작성일</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {allPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      post.boardType === BoardType.NOTICE
                        ? 'bg-red-900/40 text-red-400'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {post.boardType === BoardType.NOTICE ? '공지' : '자유'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white max-w-[250px] truncate">{post.title}</td>
                  <td className="px-5 py-3.5 text-gray-400">{post.author}</td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(post.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Link to={`/posts/${post.id}`} className="text-gray-500 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('게시글을 강제 삭제하시겠습니까?')) deleteMutation.mutate(post.id)
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
