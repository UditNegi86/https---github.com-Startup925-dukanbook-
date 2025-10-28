import { Skeleton } from "./Skeleton";
import styles from "./ProfileFormSkeleton.module.css";

export function ProfileFormSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.grid}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className={styles.skeletonItem}>
            <Skeleton
              style={{
                height: "0.875rem",
                width: "100px",
                marginBottom: "var(--spacing-2)",
              }}
            />
            <Skeleton style={{ height: "2.5rem", width: "100%" }} />
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <Skeleton style={{ height: "2.5rem", width: "120px" }} />
      </div>
    </div>
  );
}