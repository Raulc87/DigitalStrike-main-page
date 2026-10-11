// `submission_id` lifecycle (contract §5.4): the same id for every retry of an unchanged payload;
// a new one after a success, on a page reload (a new tracker) and whenever a field changes after
// an attempt was sent, so an id never travels with different data.

export type IdFactory = () => string;

export const randomId: IdFactory = () => crypto.randomUUID();

export class SubmissionIdTracker {
  #id: string;
  #sent = false;
  readonly #newId: IdFactory;

  constructor(newId: IdFactory = randomId) {
    this.#newId = newId;
    this.#id = newId();
  }

  /** The id to send with the next attempt; marks it as sent. */
  forAttempt(): string {
    this.#sent = true;
    return this.#id;
  }

  /** The visitor changed a field. Renews the id if the current one was already sent. */
  edited(): void {
    if (this.#sent) this.#renew();
  }

  /** A submission succeeded: the next lead gets a new id. */
  succeeded(): void {
    this.#renew();
  }

  get current(): string {
    return this.#id;
  }

  #renew(): void {
    this.#id = this.#newId();
    this.#sent = false;
  }
}
