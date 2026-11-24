import numpy as np,wave
sr=44100;duration=48;n=sr*duration;t=np.arange(n)/sr;mix=np.zeros((n,2),dtype=np.float64)
def note(m):return 440*2**((m-69)/12)
def add(start,length,midi,level,kind='pad',pan=0):
 k=int(length*sr);u=np.arange(k)/sr;f=note(midi)
 if kind=='pad':
  sig=(np.sin(2*np.pi*f*u)+.25*np.sin(2*np.pi*f*2*u+.2)+.12*np.sin(2*np.pi*(f*1.0015)*u))*.72
  env=np.sin(np.pi*np.minimum(u/length,1))**1.4
 else:
  sig=np.sin(2*np.pi*f*u+.6*np.sin(2*np.pi*f*2*u)*np.exp(-u*.7))+.16*np.sin(2*np.pi*f*3*u)
  env=(1-np.exp(-u*22))*np.exp(-u*.85)
 sig=sig*env*level;left=np.sqrt((1-pan)*.5);right=np.sqrt((1+pan)*.5)
 for delay,decay in [(0,1),(.32,.24),(.72,.13),(1.21,.07)]:
  idx=(int((start+delay)*sr)+np.arange(k))%n;mix[idx,0]+=sig*decay*left;mix[idx,1]+=sig*decay*right
chords=[[50,57,61,66],[47,54,57,62],[43,50,54,59],[45,52,57,59]]
for j,chord in enumerate(chords):
 for i,m in enumerate(chord):add(j*12,15,m,.16,pan=(i-1.5)*.23)
melody=[74,78,81,85,83,81,78,76,74,78,81,78,71,74,78,81,79,78,74,71,69,73,76,78]
for i,m in enumerate(melody):add(i*2,5.5,m,.2,'bell',np.sin(i*1.7)*.45)
mix=np.tanh(mix*1.1);mix*=.92/max(np.max(np.abs(mix)),1e-6)
with wave.open('/tmp/inner-orbit-music.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((mix*32767).astype('<i2').tobytes())
print('Normalized stereo score, 48 seconds; peak',np.max(np.abs(mix)),'RMS',np.sqrt(np.mean(mix**2)))
