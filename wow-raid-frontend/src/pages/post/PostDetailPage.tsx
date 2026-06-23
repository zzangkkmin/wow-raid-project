import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { postApi } from '@/api/post.api'
import { useAuthStore } from '@/stores/auth.store'
import { UserRole } from '@/types/enums'
import { formatDate } from '@/utils/date.util'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ChevronLeft, Edit, Trash2, Eye } from 'lucide-react'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postApi.getDetail(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => postApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate(`/posts?boardType=${post?.boardType}`)
    },
  })

  if (isLoading) return <LoadingSpinner />
  if (!post) return <div className="text-gray-400 text-center py-20">게시글을 찾을 수 없습니다.</div>

  const isAuthor = user?.username === post.author
  const isAdmin = user?.role === UserRole.ADMIN
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={`/posts?boardType=${post.boardType}`}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        목록으로
      </Link>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-7">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="font-medium text-gray-300">{post.author}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              {post.viewCount}
            </span>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <Link
                to={`/posts/${id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                수정
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  if (confirm('게시글을 삭제하시겠습니까?')) deleteMutation.mutate()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-300 text-sm rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제
              </button>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="mt-6 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
          {post.content}
        </div>
      </div>
    </div>
  )
}
