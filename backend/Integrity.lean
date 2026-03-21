inductive User
| Alice | Bob | Eve

open User

-- Only authorised users can modify data
def authorised : User → Prop
| Alice => True
| Bob   => True
| Eve   => False

def canModify (u : User) : Prop :=
  authorised u

theorem integrity_secure :
  ∀ u : User, ¬ authorised u → ¬ canModify u :=
by
  intro u h
  unfold canModify
  exact h