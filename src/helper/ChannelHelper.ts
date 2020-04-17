export class ChannelHelper {

	static vocalToText(channelName: string) {
		return channelName
			.toLocaleLowerCase()
			.replace(/ /g, "-")
			.replace(/[^a-z\-]/g, "")
	}
}
