<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App structure
- Shared navigation and the dashboard demo provider live in the root shell so state remains consistent across navigation.
- Dashboard-only demo interactions use browser-local state; no medical or account data is collected, and expanded product, journey and support screens remain placeholders.
- Product routes use a parent Outlet with separate index and detail leaves to keep navigation unambiguous.
