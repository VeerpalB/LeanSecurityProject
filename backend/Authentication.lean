inductive User
| Alice | Bob | Eve

open User

-- Define authentication status
def authenticated : User → Prop
| Alice => True
| Bob   => True
| Eve   => False

-- Access rule (must be authenticated)
def canAccess (u : User) : Prop :=
  authenticated u

-- Theorem: Unauthenticated users cannot access
theorem authentication_secure :
  ∀ u : User, ¬ authenticated u → ¬ canAccess u :=
by
  intro u h
  unfold canAccess
  exact h