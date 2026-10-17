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
- Public content routes share navigation and the demo provider in the root shell so all demo workflows remain accessible without an account.
- Product applications, journey entries/photos and concerns persist in browser-local demo state so navigation preserves evaluation progress without exposing account records.
- Optional authentication provides display names through a shared context and stores signup names in user metadata so guest access never depends on an auth request.
- Shared signup validation defines the client password minimum and required-name rule so signup and recovery stay consistent.
- Product routes use a parent Outlet with separate index and detail leaves to keep navigation unambiguous.
