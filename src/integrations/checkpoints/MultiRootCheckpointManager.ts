import { VcsType, WorkspaceRootManager } from "@core/workspace"
import CheckpointTracker from "./CheckpointTracker"

/**
 * Multi-root checkpoint manager for handling checkpoints across multiple workspace roots
 *
 * CURRENT IMPLEMENTATION: Simplified scaffolding that only handles the primary workspace
 * This maintains 100% backward compatibility while providing the interface for future expansion
 *
 * TODO: Full multi-root implementation will track checkpoints across all Git repositories
 */
export class MultiRootCheckpointManager {
	private primaryTracker?: CheckpointTracker // Only primary workspace for now

	// TODO: Future full implementation will use these
	// private trackers: Map<string, CheckpointTracker> = new Map()
	// private failedRoots: Set<string> = new Set()

	constructor(private workspaceManager: WorkspaceRootManager) {}

	/**
	 * Initialize checkpoint tracking for workspace roots
	 * CURRENT: Only initializes primary workspace tracker
	 * TODO: Initialize trackers for all Git repositories
	 */
	async initialize(taskId: string, globalStoragePath: string, enableCheckpointsSetting: boolean): Promise<void> {
		try {
			// SIMPLIFIED: Only handle primary workspace for now
			const primaryRoot = this.workspaceManager.getPrimaryRoot()

			if (primaryRoot && primaryRoot.vcs === VcsType.Git) {
				// Use CheckpointTracker.create() static method
				this.primaryTracker = await CheckpointTracker.create(taskId, globalStoragePath, enableCheckpointsSetting)
				console.log(`[MultiRootCheckpoint] Initialized primary workspace: ${primaryRoot.path}`)
			} else if (primaryRoot) {
				console.log(`[MultiRootCheckpoint] Primary workspace is not a Git repository: ${primaryRoot.path}`)
			} else {
				console.log(`[MultiRootCheckpoint] No primary workspace found`)
			}

			// TODO: Full implementation would initialize all Git repositories
			// for (const root of this.workspaceManager.getRoots()) {
			//     if (root.vcs === VcsType.Git) {
			//         const tracker = await CheckpointTracker.create(taskId, globalStoragePath, enableCheckpointsSetting)
			//         this.trackers.set(root.path, tracker)
			//     }
			// }
		} catch (error) {
			console.error("[MultiRootCheckpoint] Failed to initialize:", error)
			// Don't throw - allow task to continue without checkpoints
		}
	}

	/**
	 * Create a checkpoint across workspace roots
	 * CURRENT: Only creates checkpoint in primary workspace
	 * TODO: Create checkpoints across all Git repositories
	 */
	async createCheckpoint(message: string): Promise<string | undefined> {
		try {
			// SIMPLIFIED: Only checkpoint primary workspace
			if (this.primaryTracker) {
				const commitHash = await this.primaryTracker.commit()
				console.log(`[MultiRootCheckpoint] Created checkpoint in primary workspace: ${commitHash}`)
				return commitHash
			}

			// TODO: Full implementation would checkpoint all repositories
			// const promises = Array.from(this.trackers.values()).map(
			//     tracker => tracker.commit().catch(error => {
			//         console.error(`[MultiRootCheckpoint] Failed to create checkpoint in ${tracker.cwd}:`, error)
			//         this.failedRoots.add(tracker.cwd)
			//         return undefined
			//     })
			// )
			// const results = await Promise.allSettled(promises)
			// return results.find(r => r.status === 'fulfilled' && r.value)?.value
		} catch (error) {
			console.error("[MultiRootCheckpoint] Failed to create checkpoint:", error)
			// Don't throw - allow task to continue
		}
		return undefined
	}

	/**
	 * Restore checkpoints across workspace roots
	 * CURRENT: Only restores primary workspace checkpoint
	 * TODO: Restore checkpoints across all Git repositories
	 */
	async restoreCheckpoint(commitHash: string): Promise<void> {
		try {
			// SIMPLIFIED: Only restore primary workspace
			if (this.primaryTracker) {
				await this.primaryTracker.resetHead(commitHash)
				console.log(`[MultiRootCheckpoint] Restored checkpoint in primary workspace: ${commitHash}`)
			}

			// TODO: Full implementation would restore all repositories
			// const promises = Array.from(this.trackers.values()).map(
			//     tracker => tracker.resetHead(commitHash).catch(error => {
			//         console.error(`[MultiRootCheckpoint] Failed to restore checkpoint in ${tracker.cwd}:`, error)
			//     })
			// )
			// await Promise.allSettled(promises)
		} catch (error) {
			console.error("[MultiRootCheckpoint] Failed to restore checkpoint:", error)
			throw error // Restoration failures should be reported
		}
	}

	/**
	 * Get the primary checkpoint tracker for backward compatibility
	 * This ensures existing code that expects a single tracker continues to work
	 */
	getTracker(): CheckpointTracker | undefined {
		return this.primaryTracker
	}

	/**
	 * Check if checkpoint tracking is available
	 */
	isAvailable(): boolean {
		return this.primaryTracker !== undefined
	}

	/**
	 * Get checkpoint history for the primary workspace
	 * TODO: Extend to return history from all workspace roots
	 */
	async getCheckpointHistory(): Promise<any[]> {
		if (this.primaryTracker) {
			// Assuming CheckpointTracker has a method to get history
			// This may need to be implemented in CheckpointTracker if it doesn't exist
			return [] // Placeholder - implement based on CheckpointTracker interface
		}
		return []
	}

	/**
	 * Dispose of all checkpoint trackers
	 */
	dispose(): void {
		if (this.primaryTracker) {
			// Assuming CheckpointTracker has a dispose method
			// this.primaryTracker.dispose()
		}

		// TODO: Full implementation would dispose all trackers
		// this.trackers.forEach(tracker => tracker.dispose())
		// this.trackers.clear()
		// this.failedRoots.clear()
	}
}
