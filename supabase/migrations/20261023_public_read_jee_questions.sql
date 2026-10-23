create policy "Public can read practice questions"
on public.jee_questions
for select
to anon, authenticated
using (true);
