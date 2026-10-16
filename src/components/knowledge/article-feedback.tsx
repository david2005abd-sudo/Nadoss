'use client';

import { useActionState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { submitArticleFeedbackAction, type ArticleActionState } from '@/app/dashboard/knowledge/actions';
import { Button } from '@/components/ui/button';

const initialState: ArticleActionState = {};

export function ArticleFeedback({
  articleId,
  helpfulCount,
}: {
  articleId: string;
  helpfulCount: number;
}) {
  const [state, formAction, isPending] = useActionState(submitArticleFeedbackAction, initialState);

  if (state.success) {
    return (
      <div className="mt-6 rounded-xl border border-green-100 bg-green-50 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
        <p className="mt-2 text-sm text-green-800">{state.success}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
      <p className="text-center text-sm font-medium text-gray-700">
        هل كان هذا المقال مفيدًا؟
      </p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <form action={formAction}>
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="isHelpful" value="true" />
          <Button type="submit" variant="outline" disabled={isPending}>
            <ThumbsUp className="h-4 w-4" />
            نعم ({helpfulCount})
          </Button>
        </form>
        <form action={formAction}>
          <input type="hidden" name="articleId" value={articleId} />
          <input type="hidden" name="isHelpful" value="false" />
          <Button type="submit" variant="outline" disabled={isPending}>
            <ThumbsDown className="h-4 w-4" />
            لا
          </Button>
        </form>
      </div>
    </div>
  );
}
