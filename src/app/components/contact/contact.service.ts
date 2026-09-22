import { Injectable } from '@angular/core';

/** The endpoint is a Pages Function on this same origin — see functions/api/contact.ts. */
const ENDPOINT = '/api/contact';

export interface ContactSubmission {
  name: string;
  email: string;
  phone: string;
  message: string;
  office: 'lb' | 'ae';
  /** Honeypot. Always sent, always empty unless a bot filled the hidden field. */
  company: string;
}

/** Why a submission failed, in the terms the form needs to explain it. */
export type SubmitFailure = 'rate_limited' | 'failed';

@Injectable({ providedIn: 'root' })
export class ContactService {
  /** Resolves on success, rejects with a SubmitFailure the form can translate. */
  async send(submission: ContactSubmission): Promise<void> {
    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
    } catch {
      // Offline, DNS failure, or the request never left the device.
      throw 'failed' satisfies SubmitFailure;
    }

    if (response.status === 429) {
      throw 'rate_limited' satisfies SubmitFailure;
    }
    if (!response.ok) {
      throw 'failed' satisfies SubmitFailure;
    }
  }
}
